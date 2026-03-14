const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date },
  activity: { type: String, required: true },
  location: { type: String },
  notes: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  time: { type: String },
}, { timestamps: true });

const joinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, maxlength: 300 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
});

const squadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Squad name is required'],
    trim: true,
    minlength: 3,
    maxlength: 60,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    index: true,
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxMembers: {
    type: Number,
    default: 8,
    min: 2,
    max: 20,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null,
  },
  itinerary: [itineraryItemSchema],
  joinRequests: [joinRequestSchema],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['forming', 'confirmed', 'ongoing', 'completed'],
    default: 'forming',
  },
  chatRoom: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

// Generate chat room ID before save
squadSchema.pre('save', function (next) {
  if (!this.chatRoom) {
    this.chatRoom = `squad_${this._id}`;
  }
  next();
});

squadSchema.index({ destination: 1 });
squadSchema.index({ members: 1 });
squadSchema.index({ creator: 1 });

module.exports = mongoose.model('Squad', squadSchema);
