const socketConfig = require("../config/socket");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const jwt = require("jsonwebtoken");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vectors.service");

function initSocketServer(httpServer) {
  const io = socketConfig.init(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://llmmodel-midikaif.onrender.com",
      ],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies) {
      next(new Error("Authentication error: no token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New Socket connection: ", socket.id);

    socket.on("ai-message", async (messagePayload) => {
      console.log("message -> ", messagePayload);

      //Rate limiting: Allow max 1 message every 2 seconds per socket
      if (socket.lastMessageTime) {
        const timeSinceLastMessage = Date.now() - socket.lastMessageTime;

        if (timeSinceLastMessage < 2000) {
          console.log(
            "Please wait for 2 seconds before sending another message.",
          );
          socket.emit("error", {
            message:
              "Please wait for 2 seconds before sending another message.",
          });
          return;
        }
      }

      socket.lastMessageTime = Date.now();

      const isSameDay = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        return (
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
        );
      };

      if (socket.user) {
        const user = await userModel.findById(socket.user._id);

        if (isSameDay(user.lastRequestDate, Date.now())) {
          if (user.dailyRequests >= 20) {
            console.log(
              "Daily request limit reached for user: ",
              socket.user._id,
            );
            socket.emit("error", {
              message:
                "Daily request limit reached. Please try again tomorrow.",
            });
            return;
          } else {
            user.dailyRequests += 1;
          }
        } else {
          user.dailyRequests = 1;
        }
        user.lastRequestDate = Date.now();
        await user.save();
        socket.emit("quota-update", {
          requestsUsed: user.dailyRequests,
          maxRequests: 20,
        });
      }

      const { content, chat, isFirstMessage } = messagePayload;

      console.time("Total_Transaction");

      try {
        let stm = [];
        let ltmContext = "";
        let promptVectors = null;

        console.log("Backend");

        // ---------------------------------------------------------
        // 1. CONDITIONAL CONTEXT LOADING (The Optimization) ⚡
        // ---------------------------------------------------------
          console.time("Message_Vector_Gen");
          // A. Start generating vectors AND saving to DB in parallel
          const [message, vectors] = await Promise.all([
            messageModel.create({
              chat: chat,
              user: socket.user._id,
              content: content,
              role: "user",
            }),
            generateVector(content), // 🐢 Expensive!
          ]);
          console.timeEnd("Message_Vector_Gen");

          promptVectors = vectors;

          console.time("Memory_ChatHistory_Fetch");
          // B. Search for Context (LTM & STM)
          const [memory, chatHistory] = await Promise.all([
            queryMemory({
              queryVector: vectors[0].values,
              limit: 3,
              metadata: { user: socket.user._id },
            }),
            isFirstMessage ? Promise.resolve([]) :
            messageModel
              .find({ chat: chat })
              .sort({ createdAt: -1 })
              .limit(20)
              .lean()
          ]);
          console.timeEnd("Memory_ChatHistory_Fetch");

          if (memory && memory.matches[0]?.score > 0.98) {
            console.log("🟢 CACHE HIT! Bypassing Gemini API.");

            const cachedResponse =
              memory.matches[0].metadata?.aiResponse ||
              "Sorry, didn't hear that. Could you please repeat?";

            socket.emit("ai-response", {
              content: cachedResponse,
              chat: chat,
            });

            console.timeEnd("Total_Transaction");

            await messageModel.create({
              chat: chat,
              user: socket.user._id,
              content: cachedResponse,
              role: "model",
            });

            return;
          }

          console.log("🔴 CACHE MISS. Proceeding to Gemini API.");

          console.time("STM");
          // C. Format Short Term Memory
          stm = chatHistory.reverse().map((item) => ({
            role: item.role,
            parts: [{ text: item.content }],
          }));
          console.timeEnd("STM");

          console.time("LTM");
          // D. Format Long Term Memory (Fixing the "undefined" bug) 🧼
          if (memory && memory.matches.length > 0) {
            const memoryText = memory.matches
              .map((item) => item.metadata?.text)
              .join("\n");
            ltmContext = `
              Relevant context from previous conversations:
              ${memoryText}
            `;
            console.log("LTM Context: ", memoryText);
          }
          console.timeEnd("LTM");
        

        // ---------------------------------------------------------
        // 2. CONSTRUCT PROMPT & GENERATE 🧠
        // ---------------------------------------------------------

        // We inject the LTM context (if it exists) into the System Instruction logic
        // or as the first part of the prompt.
        const finalPrompt = [
          // Only add LTM block if we actually have context
          ...(ltmContext
            ? [
                {
                  role: "user",
                  parts: [{ text: ltmContext }],
                },
              ]
            : []),

          ...stm,
          // The current user message
          { role: "user", parts: [{ text: content }] },
        ];

        const response = await generateResponse(finalPrompt);

        // 3. SEND REPLY FAST (Fire and Forget) 🔥
        socket.emit("ai-response", {
          content: response,
          chat: chat,
        });
        console.log("Reply sent ", response);

        console.timeEnd("Total_Transaction");

        // ---------------------------------------------------------
        // 4. BACKGROUND WORK (After Reply) 🧹
        // ---------------------------------------------------------
        // Now that the user is happy reading the reply, we do the
        // heavy vector work for the *next* turn.

        (async () => {
          try {
            if (!promptVectors) {
              promptVectors = await generateVector(content);
            }

            const pairedText = `User: ${content} \n Ai Response: ${response}`;

            // Generate Response Vector
            const responseMessage = await messageModel.create({
              chat: chat,
              user: socket.user._id,
              content: response,
              role: "model",
            });

            // Save Response to Vector DB
            await createMemory({
              vectors: promptVectors,
              messageId: responseMessage._id.toString(),
              metadata: {
                chat: chat.toString(),
                user: socket.user._id.toString(),
                text: pairedText,
                originalPrompt: content,
                aiResponse: response,
                role: "paired-interaction",
              },
            });
          } catch (bgError) {
            console.error("Background task failed:", bgError);
          }
        })();
      } catch (error) {
        console.error("Socket Error:", error);
        socket.emit("error", {
          message:
            error?.APIError?.error?.message.slice(0, 100) ||
            "An error occurred while processing your message.",
        });
      }
    });
  });
}

module.exports = initSocketServer;
