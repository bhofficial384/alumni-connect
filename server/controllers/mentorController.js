const User = require('../models/User');

const getMentors = async (req, res) => {
  try {
    const query = { 
      role: 'mentor',
      isApproved: true
    };
    
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    
    if (req.query.company) {
      query.company = { $regex: req.query.company, $options: 'i' };
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$and = [
        {
          $or: [
            { name: searchRegex },
            { bio: searchRegex },
            { company: searchRegex }
          ]
        }
      ];
    }

    const mentors = await User.find(query).select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching mentors', error: error.message });
  }
};

const getMentor = async (req, res) => {
  try {
    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' }).select('-password');
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching mentor', error: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.availability = req.body.availability;
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating availability', error: error.message });
  }
};

module.exports = {
  getMentors,
  getMentor,
  updateAvailability
};
