const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.post('/',authMiddleware.authUser,chatController.createChat);
router.get('/',authMiddleware.authUser,chatController.getChats);
router.get('/:id',authMiddleware.authUser,chatController.getChatById);
router.delete('/:id',authMiddleware.authUser,chatController.deleteChatById);




module.exports = router;