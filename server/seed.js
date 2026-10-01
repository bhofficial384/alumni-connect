const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Session = require('./models/Session');

dotenv.config();

const seedDB = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Session.deleteMany();
    console.log('Existing data cleared');

    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const mentorPassword = await bcrypt.hash('Mentor@123', 12);
    const studentPassword = await bcrypt.hash('Student@123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@alumniconnect.com',
      password: adminPassword,
      role: 'admin'
    });

    const mentor1 = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh@alumniconnect.com',
      password: mentorPassword,
      role: 'mentor',
      company: 'Google',
      domain: 'Software Engineering',
      graduationYear: 2018,
      bio: 'Leading search infrastructure at Google for 6+ years. Passionate about helping students break into FAANG companies through system design and DSA prep.',
      availability: [{ day: 'Monday', startTime: '18:00', endTime: '20:00' }, { day: 'Saturday', startTime: '10:00', endTime: '12:00' }]
    });

    const mentor2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@alumniconnect.com',
      password: mentorPassword,
      role: 'mentor',
      company: 'Goldman Sachs',
      domain: 'Finance',
      graduationYear: 2017,
      bio: 'Investment banking specialist with deep expertise in financial modeling, valuation, and interview preparation.',
      availability: [{ day: 'Wednesday', startTime: '17:00', endTime: '19:00' }]
    });

    const mentor3 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@alumniconnect.com',
      password: mentorPassword,
      role: 'mentor',
      company: 'McKinsey & Company',
      domain: 'Consulting',
      graduationYear: 2019,
      bio: 'Strategy consultant helping students prepare for case interviews and understand the consulting industry inside out.',
      availability: [{ day: 'Saturday', startTime: '10:00', endTime: '12:00' }]
    });

    const mentor4 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@alumniconnect.com',
      password: mentorPassword,
      role: 'mentor',
      company: 'Microsoft',
      domain: 'Product Management',
      graduationYear: 2020,
      bio: 'Product Manager at Azure. Guiding students through PM interviews, career transitions, and product thinking.',
      availability: [{ day: 'Friday', startTime: '16:00', endTime: '18:00' }]
    });

    const student1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@student.com',
      password: studentPassword,
      role: 'student',
      graduationYear: 2025
    });

    const student2 = await User.create({
      name: 'Ananya Singh',
      email: 'ananya@student.com',
      password: studentPassword,
      role: 'student',
      graduationYear: 2024
    });

    await Session.create({
      student: student1._id,
      mentor: mentor1._id,
      topic: 'Career in Software Engineering',
      message: 'I would like to know about software engineering roles.',
      status: 'pending'
    });

    await Session.create({
      student: student1._id,
      mentor: mentor2._id,
      topic: 'Investment Banking Preparation',
      message: 'Need help preparing for IB interviews.',
      status: 'approved'
    });

    await Session.create({
      student: student2._id,
      mentor: mentor3._id,
      topic: 'Consulting Case Interview Prep',
      message: 'Can we do a mock case interview?',
      status: 'completed'
    });

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== Demo Credentials ===');
    console.log('Admin:   admin@alumniconnect.com   / Admin@123');
    console.log('Mentor:  rajesh@alumniconnect.com  / Mentor@123');
    console.log('Mentor:  priya@alumniconnect.com   / Mentor@123');
    console.log('Mentor:  amit@alumniconnect.com    / Mentor@123');
    console.log('Mentor:  sneha@alumniconnect.com   / Mentor@123');
    console.log('Student: rahul@student.com         / Student@123');
    console.log('Student: ananya@student.com        / Student@123');
    console.log('========================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
