const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    index: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  budgetLevel: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury', 'backpacker'],
    default: 'mid-range',
  },
  interests: [{
    type: String,
    enum: [
      'adventure', 'beaches', 'culture', 'food', 'hiking', 'history',
      'luxury', 'nature', 'nightlife', 'photography', 'road-trips',
      'skiing', 'solo-travel', 'spirituality', 'wildlife',
    ],
  }],
  description: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  squad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Squad',
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning',
  },
  maxGroupSize: {
    type: Number,
    default: 6,
    min: 1,
    max: 20,
  },
}, { timestamps: true });

tripSchema.index({ destination: 'text', description: 'text' });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ creator: 1 });

module.exports = mongoose.model('Trip', tripSchema);
