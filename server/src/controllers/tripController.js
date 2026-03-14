const asyncHandler = require('../utils/asyncHandler');
const tripService = require('../services/tripService');

const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.user._id, req.body);
  res.status(201).json({ trip, message: 'Trip created successfully' });
});

const getTrips = asyncHandler(async (req, res) => {
  const result = await tripService.getTrips(req.query);
  res.json(result);
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);
  res.json({ trip });
});

const getUserTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getUserTrips(req.user._id);
  res.json({ trips });
});

const updateTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.user._id, req.body);
  res.json({ trip, message: 'Trip updated' });
});

const deleteTrip = asyncHandler(async (req, res) => {
  await tripService.deleteTrip(req.params.id, req.user._id);
  res.json({ message: 'Trip deleted' });
});

const getMatches = asyncHandler(async (req, res) => {
  const matches = await tripService.getMatches(req.user._id);
  res.json({ matches });
});

module.exports = { createTrip, getTrips, getTripById, getUserTrips, updateTrip, deleteTrip, getMatches };
