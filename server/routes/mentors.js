const express = require('express');
const router = express.Router();
const { getMentors, getMentor, updateAvailability } = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMentors);
router.get('/:id', getMentor);
router.put('/availability', protect, authorize('mentor'), updateAvailability);

module.exports = router;
