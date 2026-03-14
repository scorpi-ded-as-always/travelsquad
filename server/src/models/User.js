const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  homeCity: {
    type: String,
    default: '',
    trim: true,
  },
  interests: [{
    type: String,
    enum: [
      'adventure', 'beaches', 'culture', 'food', 'hiking', 'history',
      'luxury', 'nature', 'nightlife', 'photography', 'road-trips',
      'skiing', 'solo-travel', 'spirituality', 'wildlife',
    ],
  }],
  travelStyle: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury', 'backpacker'],
    default: 'mid-range',
  },
  squads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Squad' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for faster email lookups
userSchema.index({ email: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
