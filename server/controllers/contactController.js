const Contact = require('../models/Contact');
const { sendContactNotificationEmail } = require('../utils/emailService');

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Send admin email notification asynchronously
    sendContactNotificationEmail({ name, email, subject, message }).catch(err => {
      console.warn('Contact email notification error:', err.message);
    });
    
    res.status(201).json({ message: 'Message sent successfully', contactId: contact._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting contact form', error: error.message });
  }
};

module.exports = {
  submitContact
};
