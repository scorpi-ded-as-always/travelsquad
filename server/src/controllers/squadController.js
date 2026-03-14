const asyncHandler = require('../utils/asyncHandler');
const squadService = require('../services/squadService');

const createSquad = asyncHandler(async (req, res) => {
  const squad = await squadService.createSquad(req.user._id, req.body);
  res.status(201).json({ squad, message: 'Squad created' });
});

const getSquads = asyncHandler(async (req, res) => {
  const result = await squadService.getSquads(req.query);
  res.json(result);
});

const getSquadById = asyncHandler(async (req, res) => {
  const squad = await squadService.getSquadById(req.params.id);
  res.json({ squad });
});

const getUserSquads = asyncHandler(async (req, res) => {
  const squads = await squadService.getUserSquads(req.user._id);
  res.json({ squads });
});

const requestJoin = asyncHandler(async (req, res) => {
  const squad = await squadService.requestJoin(req.params.id, req.user._id, req.body.message);
  res.json({ squad, message: 'Join request sent' });
});

const handleJoinRequest = asyncHandler(async (req, res) => {
  const squad = await squadService.handleJoinRequest(
    req.params.id,
    req.params.requestId,
    req.body.action,
    req.user._id
  );
  res.json({ squad, message: `Request ${req.body.action}` });
});

const leaveSquad = asyncHandler(async (req, res) => {
  await squadService.leaveSquad(req.params.id, req.user._id);
  res.json({ message: 'Left squad' });
});

const addItineraryItem = asyncHandler(async (req, res) => {
  const squad = await squadService.addItineraryItem(req.params.id, req.user._id, req.body);
  res.json({ squad, message: 'Activity added to itinerary' });
});

const removeItineraryItem = asyncHandler(async (req, res) => {
  const squad = await squadService.removeItineraryItem(req.params.id, req.params.itemId, req.user._id);
  res.json({ squad, message: 'Activity removed' });
});

module.exports = {
  createSquad, getSquads, getSquadById, getUserSquads,
  requestJoin, handleJoinRequest, leaveSquad,
  addItineraryItem, removeItineraryItem,
};
