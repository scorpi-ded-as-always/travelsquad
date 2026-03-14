const express = require('express');
const { body } = require('express-validator');
const {
  createTrip, getTrips, getTripById, getUserTrips,
  updateTrip, deleteTrip, getMatches,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', getTrips);
router.get('/my', protect, getUserTrips);
router.get('/match', protect, getMatches);
router.get('/:id', getTripById);

router.post('/', protect, [
  body('destination').trim().notEmpty().withMessage('Destination required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
], validate, createTrip);

router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
