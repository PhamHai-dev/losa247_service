const ChatSession = require('../../models/ChatSession.model');
const ChatMessage = require('../../models/ChatMessage.model');

exports.startSession = async (req, res, next) => {
  try {
    const { customerName, customerPhone } = req.body;
    
    const session = new ChatSession({
      customerName,
      customerPhone,
      mode: 'bot',
      status: 'open',
    });
    
    await session.save();
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};
