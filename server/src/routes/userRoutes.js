const express = require('express');
const { getUserById, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', getUserById);

module.exports = router;
