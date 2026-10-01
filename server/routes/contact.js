const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { contactRules, validate } = require('../middleware/validate');

router.post('/', contactRules, validate, submitContact);

module.exports = router;
