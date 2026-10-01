const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for migration.');

    // 1. Set isApproved: true and approvalStatus: 'approved' for all mentors who do not have it set
    const result = await mongoose.connection.collection('users').updateMany(
      { role: 'mentor', isApproved: { $exists: false } },
      { $set: { isApproved: true, approvalStatus: 'approved' } }
    );
    console.log(`Migrated ${result.modifiedCount} legacy mentor accounts to approved.`);

    // 2. Also ensure all students have isApproved: true
    await mongoose.connection.collection('users').updateMany(
      { role: { $in: ['student', 'admin'] } },
      { $set: { isApproved: true, approvalStatus: 'approved' } }
    );

    // 3. Create or update a realistic sample pending mentor so the Admin Dashboard has an active pending mentor to review and approve!
    const pendingEmail = 'karan.aws@alumniconnect.com';
    const existing = await mongoose.connection.collection('users').findOne({ email: pendingEmail });
    if (!existing) {
      const pwd = await bcrypt.hash('Mentor@123', 12);
      await mongoose.connection.collection('users').insertOne({
        name: 'Karan Mehra',
        email: pendingEmail,
        password: pwd,
        role: 'mentor',
        company: 'Amazon Web Services',
        domain: 'Cloud Architecture & DevOps',
        bio: 'Senior Solutions Architect with 7+ years of experience helping teams architect high-availability cloud platforms.',
        isApproved: false,
        approvalStatus: 'pending',
        isEmailVerified: true,
        authProvider: 'local',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Sample pending mentor created: Karan Mehra (karan.aws@alumniconnect.com)');
    } else {
      await mongoose.connection.collection('users').updateOne(
        { email: pendingEmail },
        { $set: { isApproved: false, approvalStatus: 'pending' } }
      );
      console.log('Sample pending mentor reset to pending.');
    }

    console.log('Migration finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
