const ChatSession = require('../../models/ChatSession.model');
const ChatMessage = require('../../models/ChatMessage.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { getIo } = require('../../config/socket');

exports.getSessions = async (req, res, next) => {
  try {
    const { page, limit, search, status, mode } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      ChatSession.find(filter)
        .populate('assignedAdmin', 'name')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(l),
      ChatSession.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.id }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

exports.takeoverSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });

    session.mode = 'human';
    session.assignedAdmin = req.user._id;
    await session.save();

    const io = getIo();
    io.of('/chat').to(session._id.toString()).emit('session_mode_changed', { mode: 'human', adminId: req.user._id });

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.releaseSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });

    session.mode = 'bot';
    session.assignedAdmin = null;
    await session.save();

    const io = getIo();
    io.of('/chat').to(session._id.toString()).emit('session_mode_changed', { mode: 'bot' });

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.updateMessageFeedback = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const message = await ChatMessage.findByIdAndUpdate(req.params.id, { feedback }, { new: true });
    
    if (!message) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy tin nhắn' } });

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// Webhook từ n8n trả lời chat
exports.n8nChatReplyWebhook = async (req, res, next) => {
  try {
    const { sessionId, content } = req.body;
    
    if (!sessionId || !content) {
      return res.status(400).json({ success: false, message: 'Missing sessionId or content' });
    }

    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.mode !== 'bot') {
      return res.json({ success: true, message: 'Session is in human mode, bot reply ignored' });
    }

    const message = new ChatMessage({
      sessionId,
      sender: 'bot',
      content,
    });
    await message.save();

    session.lastMessageAt = new Date();
    await session.save();

    const io = getIo();
    io.of('/chat').to(sessionId.toString()).emit('bot_reply', message);

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
