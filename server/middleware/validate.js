const { validationResult, body } = require('express-validator');

const registerRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'mentor']).withMessage('Role must be either student or mentor'),
  body('name').optional().trim(),
  body('phoneNumber').optional().trim()
];

const loginRules = [
  (req, res, next) => {
    if (!req.body.email && req.body.identifier) {
      req.body.email = req.body.identifier;
    }
    next();
  },
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Please provide an email address, mobile number, or registration number'),
  body('password').notEmpty().withMessage('Password is required')
];

const sessionRules = [
  body('mentorId').notEmpty().withMessage('Mentor ID is required'),
  body('topic').notEmpty().withMessage('Topic is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const contactRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const statusUpdateRules = [
  body('status').isIn(['approved', 'rejected', 'completed']).withMessage('Invalid status')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return res.status(400).json({
      message: formattedErrors[0]?.message || 'Validation error',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = {
  registerRules,
  loginRules,
  sessionRules,
  contactRules,
  statusUpdateRules,
  validate
};
