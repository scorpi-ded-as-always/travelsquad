const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register({ name, email, password, bio, homeCity, interests, travelStyle }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const user = await User.create({
      name,
      email,
      password,
      bio,
      homeCity,
      interests: interests || [],
      travelStyle: travelStyle || 'mid-range',
    });

    const token = generateToken(user._id);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Account deactivated'), { statusCode: 403 });
    }

    const token = generateToken(user._id);
    // Remove password from returned object
    user.password = undefined;
    return { user, token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).populate('squads', 'name destination status');
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }

  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'bio', 'homeCity', 'interests', 'travelStyle', 'profilePhoto'];
    const sanitized = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) sanitized[field] = updates[field];
    });

    const user = await User.findByIdAndUpdate(userId, sanitized, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }
}

module.exports = new AuthService();
