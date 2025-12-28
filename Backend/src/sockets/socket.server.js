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
      origin: "http://localhost:5173",
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
        console.log("user prompt -> ", messagePayload.content)
        const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: messagePayload.content,
          role: "user",
        }),
        await generateVector(messagePayload.content),
      ]);

      await createMemory({
        vectors,
        messageId: message.id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors[0].values,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        }),
        (messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()),
      ]);
      

      const stm = chatHistory.reverse().map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
                        these are some previous messages from the chat, use them to generate a response.
                        ${memory && memory.map((item) => item.metadata.text).join("\n")}
                    `,
            },
          ],
        },
      ];

      const response = await generateResponse([...ltm, ...stm]);

      console.log("Generated response: ", response);

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
      
      
      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),
        generateVector(response),
      ]);

      
      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

      
    });
  });
}

module.exports = initSocketServer;
