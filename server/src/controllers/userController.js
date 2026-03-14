const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('squads', 'name destination status');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q, interest } = req.query;
  const query = {};
  if (q) query.name = { $regex: q, $options: 'i' };
  if (interest) query.interests = interest;

  const users = await User.find(query).select('name profilePhoto homeCity interests travelStyle bio').limit(20);
  res.json({ users });
});

module.exports = { getUserById, searchUsers };
