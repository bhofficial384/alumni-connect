const express = require('express');
const router = express.Router();
const {
  getStudents,
  updateStudent,
  deleteStudent,
  getMentors,
  updateMentorApproval,
  getStats,
  getContacts,
  deleteContact
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, authorize('admin'), getStudents);
router.put('/students/:id', protect, authorize('admin'), updateStudent);
router.patch('/students/:id', protect, authorize('admin'), updateStudent);
router.delete('/students/:id', protect, authorize('admin'), deleteStudent);
router.get('/mentors', protect, authorize('admin'), getMentors);
router.patch('/mentors/:id/approval', protect, authorize('admin'), updateMentorApproval);
router.put('/mentors/:id/approval', protect, authorize('admin'), updateMentorApproval);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/contacts', protect, authorize('admin'), getContacts);
router.delete('/contacts/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
