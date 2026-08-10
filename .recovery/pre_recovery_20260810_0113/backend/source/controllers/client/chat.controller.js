const ChatSession = require('../../models/ChatSession.model');
const ChatMessage = require('../../models/ChatMessage.model');

const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const uploadHelper = require('../../helpers/upload');

exports.startSession = async (req, res, next) => {
  try {
    const { customerName, customerPhone } = req.body;
    let customerId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_CLIENT_SECRET);
        customerId = decoded.id;
      } catch (e) { }
    }

    if (customerId) {
      const existing = await ChatSession.findOne({ customerId }).sort({ createdAt: -1 });
      if (existing) {
        if (customerName || customerPhone) {
          existing.customerName = customerName || existing.customerName;
          existing.customerPhone = customerPhone || existing.customerPhone;
          await existing.save();
        }
        return res.status(200).json({ success: true, data: existing });
      }
    }

    const session = new ChatSession({
      customerName,
      customerPhone,
      customerId,
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

exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng chọn file' } });
    }

    const secureUrl = await uploadHelper.uploadToCloudinary(req.file);
    res.json({ success: true, data: { url: secureUrl } });
  } catch (err) {
    next(err);
  }
};
