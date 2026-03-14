const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/messageService');

const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages(req.params.squadId, req.user._id, req.query);
  res.json({ messages });
});

module.exports = { getMessages };
