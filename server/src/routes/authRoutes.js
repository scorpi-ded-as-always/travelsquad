const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], validate, register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
