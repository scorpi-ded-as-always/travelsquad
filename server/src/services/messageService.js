const Message = require('../models/Message');
const Squad = require('../models/Squad');

class MessageService {
  async getMessages(squadId, userId, { page = 1, limit = 50 } = {}) {
    // Verify membership
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });
    if (!squad.members.some(m => m.toString() === userId.toString())) {
      throw Object.assign(new Error('Not a squad member'), { statusCode: 403 });
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find({ squad: squadId })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return messages.reverse(); // chronological order
  }

  async saveMessage({ squadId, senderId, content, type = 'text' }) {
    const message = await Message.create({
      squad: squadId,
      sender: senderId,
      content,
      type,
    });

    return message.populate('sender', 'name profilePhoto');
  }
}

module.exports = new MessageService();
