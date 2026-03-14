const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token, message: 'Registration successful' });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ user, token, message: 'Login successful' });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json({ user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ user, message: 'Profile updated' });
});

module.exports = { register, login, getProfile, updateProfile };
