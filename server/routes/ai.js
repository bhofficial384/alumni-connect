const express = require('express');
const router = express.Router();
const {
  chatAssistant,
  draftOutreach,
  interviewPrep,
  resumePolish,
  generateMessage
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI features are authenticated for students, mentors, and admins
router.post('/chat', protect, chatAssistant);
router.post('/draft-outreach', protect, draftOutreach);
router.post('/interview-prep', protect, interviewPrep);
router.post('/resume-polish', protect, resumePolish);

// Legacy endpoint compatibility
router.post('/', protect, generateMessage);

module.exports = router;
