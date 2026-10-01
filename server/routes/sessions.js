const express = require('express');
const router = express.Router();
const { createSession, getStudentSessions, getIncomingSessions, updateSessionStatus } = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');
const { sessionRules, statusUpdateRules, validate } = require('../middleware/validate');

router.post('/', protect, authorize('student'), sessionRules, validate, createSession);
router.get('/my', protect, authorize('student'), getStudentSessions);
router.get('/incoming', protect, authorize('mentor'), getIncomingSessions);
router.patch('/:id/status', protect, authorize('mentor'), statusUpdateRules, validate, updateSessionStatus);

module.exports = router;
