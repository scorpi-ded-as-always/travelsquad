const express = require('express');
const { body } = require('express-validator');
const {
  createSquad, getSquads, getSquadById, getUserSquads,
  requestJoin, handleJoinRequest, leaveSquad,
  addItineraryItem, removeItineraryItem,
} = require('../controllers/squadController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', getSquads);
router.get('/my', protect, getUserSquads);
router.get('/:id', getSquadById);

router.post('/', protect, [
  body('name').trim().isLength({ min: 3, max: 60 }).withMessage('Squad name 3-60 chars'),
  body('destination').trim().notEmpty().withMessage('Destination required'),
], validate, createSquad);

router.post('/:id/join', protect, requestJoin);
router.put('/:id/join/:requestId', protect, handleJoinRequest);
router.delete('/:id/leave', protect, leaveSquad);

router.post('/:id/itinerary', protect, [
  body('day').isInt({ min: 1 }).withMessage('Day must be a positive integer'),
  body('activity').trim().notEmpty().withMessage('Activity required'),
], validate, addItineraryItem);

router.delete('/:id/itinerary/:itemId', protect, removeItineraryItem);

module.exports = router;
