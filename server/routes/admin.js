const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getMentors,
  createMentor,
  updateMentorApproval,
  deleteMentor,
  getStats,
  getContacts,
  deleteContact
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, authorize('admin'), getStudents);
router.post('/students', protect, authorize('admin'), createStudent);
router.put('/students/:id', protect, authorize('admin'), updateStudent);
router.patch('/students/:id', protect, authorize('admin'), updateStudent);
router.delete('/students/:id', protect, authorize('admin'), deleteStudent);

router.get('/mentors', protect, authorize('admin'), getMentors);
router.post('/mentors', protect, authorize('admin'), createMentor);
router.patch('/mentors/:id/approval', protect, authorize('admin'), updateMentorApproval);
router.put('/mentors/:id/approval', protect, authorize('admin'), updateMentorApproval);
router.delete('/mentors/:id', protect, authorize('admin'), deleteMentor);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/contacts', protect, authorize('admin'), getContacts);
router.delete('/contacts/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
