const { Server } = require("socket.io");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const jwt = require("jsonwebtoken");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vectors.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
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
    const { content, chat, isFirstMessage } = messagePayload;

    console.time("Total_Transaction");

    try {
      let stm = [];
      let ltmContext = "";
      let promptVectors = null;

      // ---------------------------------------------------------
      // 1. CONDITIONAL CONTEXT LOADING (The Optimization) ⚡
      // ---------------------------------------------------------
      if (isFirstMessage) {
        // 🚀 FAST PATH: Skip vector generation and DB searching
        console.log("First message detected. Skipping context search.");

        console.time("Fast_Path");
        // Just save the message text to DB (Fast)
        await messageModel.create({
          chat: chat,
          user: socket.user._id,
          content: content,
          role: "user",
        });
        console.timeEnd("Fast_Path");
      } else {
        // 🐢 NORMAL PATH: Do the heavy lifting for context

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
          messageModel
            .find({ chat: chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        ]);
        console.timeEnd("Memory_ChatHistory_Fetch");

        console.time("STM");
        // C. Format Short Term Memory
        stm = chatHistory.reverse().map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));
        console.timeEnd("STM");

        console.time("LTM");
        // D. Format Long Term Memory (Fixing the "undefined" bug) 🧼
        if (memory && memory.length > 0) {
          const memoryText = memory
            .map((item) => item.metadata.text)
            .join("\n");
          ltmContext = `
              Relevant context from previous conversations:
              ${memoryText}
            `;
        }
        console.timeEnd("LTM");
      }

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
      console.timeEnd("Total_Transaction");

      // ---------------------------------------------------------
      // 4. BACKGROUND WORK (After Reply) 🧹
      // ---------------------------------------------------------
      // Now that the user is happy reading the reply, we do the
      // heavy vector work for the *next* turn.

      (async () => {
        try {
          // If we skipped vector gen earlier (Fast Path), do it now!
          if (!promptVectors) {
            promptVectors = await generateVector(content);
            // Also need to Retro-save the memory for the user message we created earlier
            // (You might need to fetch the message ID if you didn't keep it)
          }

          // Generate Response Vector
          const [responseMessage, responseVectors] = await Promise.all([
            messageModel.create({
              chat: chat,
              user: socket.user._id,
              content: response,
              role: "model",
            }),
            generateVector(response),
          ]);

          // Save Response to Vector DB
          await createMemory({
            vectors: responseVectors,
            messageId: responseMessage._id,
            metadata: {
              chat: chat,
              user: socket.user._id,
              text: response,
            },
          });

          // Note: If it was the first message, you should also call createMemory
          // for the *User's* message here since we skipped it in Step 1.
          if (isFirstMessage) {
            // ... Logic to save User Message vector ...
          }
        } catch (bgError) {
          console.error("Background task failed:", bgError);
        }
      })();
    } catch (error) {
      console.error("Socket Error:", error);
    }
  });
});

}

module.exports = initSocketServer;
