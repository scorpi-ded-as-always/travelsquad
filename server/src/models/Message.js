const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  squad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Squad',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: 2000,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'system', 'itinerary-update'],
    default: 'text',
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

messageSchema.index({ squad: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
