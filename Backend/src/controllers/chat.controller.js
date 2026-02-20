const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const { generateResponse } = require("../services/ai.service");

async function createChat(req, res) {
  const { prompt } = req.body;
  let title = "New Chat";

  try {
    if (prompt) {
      const titlePrompt = `Summarize this text into a concise chat title (max 5 words), do not use quotes: "${prompt}"`;
      title = !req.user?.isGuest ? await generateResponse(titlePrompt) : 'guest title';
    }

    const newChat = chatModel({
      user: req.user._id,
      title: title.trim(),
    });

    if (req?.user?.isGuest) {
      newChat.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    await newChat.save();

    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: newChat._id,
        title: newChat.title,
        lastActivity: newChat.lastActivity,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create chat" });
  }
}

async function getChats(req, res) {
  const user = req.user;
  const chats = await chatModel
    .find({ user: user._id })
    .sort({ lastActivity: -1 })
    .limit(4);

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

async function getChatById(req, res) {
  const user = req.user;
  const chatId = req.params.id;

  const chat = await messageModel.find({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat retrieved successfully",
    chat,
  });
}

async function deleteChatById(req, res) {
  const chatId = req.params.id;

  const chat = await chatModel.deleteOne({
    _id: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully",
    chat,
  });
}

module.exports = {
  createChat,
  getChats,
  getChatById,
  deleteChatById,
};
