require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Class.deleteMany({});
    // await Assignment.deleteMany({});
    // await Submission.deleteMany({});
    // console.log('Cleared existing data');

    // Create sample users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create admin if doesn't exist
    let admin = await User.findOne({ email: 'admin@demo.com' });
    if (!admin) {
      admin = new User({
        name: 'System Administrator',
        email: 'admin@demo.com',
        passwordHash,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Create teachers
    const teachers = [];
    for (let i = 1; i <= 3; i++) {
      let teacher = await User.findOne({ email: `teacher${i}@demo.com` });
      if (!teacher) {
        teacher = new User({
          name: `Teacher ${i}`,
          email: `teacher${i}@demo.com`,
          passwordHash,
          role: 'teacher',
          createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        });
        await teacher.save();
      }
      teachers.push(teacher);
    }
    console.log('Teachers created');

    // Create students
    const students = [];
    for (let i = 1; i <= 15; i++) {
      let student = await User.findOne({ email: `student${i}@demo.com` });
      if (!student) {
        student = new User({
          name: `Student ${i}`,
          email: `student${i}@demo.com`,
          passwordHash,
          role: 'student',
          createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        });
        await student.save();
      }
      students.push(student);
    }
    console.log('Students created');

    // Create classes
    const classes = [];
    const classNames = ['Mathematics 101', 'Physics 201', 'Chemistry 301', 'Biology 101', 'Computer Science 101'];
    
    for (let i = 0; i < classNames.length; i++) {
      let existingClass = await Class.findOne({ title: classNames[i] });
      if (!existingClass) {
        const randomStudents = students.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 8) + 3);
        const classObj = new Class({
          title: classNames[i],
          description: `Description for ${classNames[i]}`,
          teacherId: teachers[i % teachers.length]._id,
          members: randomStudents.map(s => ({
            userId: s._id,
            roleInClass: 'student',
            enrolledAt: new Date()
          })),
          code: `CLASS${i + 1}${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        });
        await classObj.save();
        classes.push(classObj);
      } else {
        classes.push(existingClass);
      }
    }
    console.log('Classes created');

    // Create assignments
    const assignments = [];
    const assignmentTitles = [
      'Homework 1', 'Quiz 1', 'Midterm Project', 'Lab Report 1', 'Final Essay',
      'Problem Set 2', 'Research Paper', 'Group Project', 'Lab Experiment', 'Case Study'
    ];

    for (let i = 0; i < assignmentTitles.length; i++) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      let existingAssignment = await Assignment.findOne({ 
        title: assignmentTitles[i], 
        classId: randomClass._id 
      });
      
      if (!existingAssignment) {
        const assignment = new Assignment({
          title: assignmentTitles[i],
          description: `Description for ${assignmentTitles[i]}`,
          classId: randomClass._id,
          createdBy: randomClass.teacherId,
          dueAt: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          maxScore: 100,
          createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        });
        await assignment.save();
        assignments.push(assignment);
      } else {
        assignments.push(existingAssignment);
      }
    }
    console.log('Assignments created');

    // Create submissions
    for (const assignment of assignments) {
      const classObj = await Class.findById(assignment.classId);
      const studentIds = classObj.members.filter(m => m.roleInClass === 'student').map(m => m.userId);
      const classStudents = await User.find({ _id: { $in: studentIds } });
      
      // Random number of students submit (60-90% submission rate)
      const submissionCount = Math.floor(classStudents.length * (0.6 + Math.random() * 0.3));
      const submittingStudents = classStudents.sort(() => 0.5 - Math.random()).slice(0, submissionCount);
      
      for (const student of submittingStudents) {
        let existingSubmission = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: student._id
        });
        
        if (!existingSubmission) {
          const isGraded = Math.random() > 0.3; // 70% chance of being graded
          const submission = new Submission({
            assignmentId: assignment._id,
            studentId: student._id,
            status: isGraded ? 'graded' : 'submitted',
            submittedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
            createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          });
          
          if (isGraded) {
            submission.grade = {
              score: Math.floor(Math.random() * 40) + 60, // Scores between 60-100
              max: 100
            };
            submission.feedback = 'Good work! Keep it up.';
          }
          
          await submission.save();
        }
      }
    }
    console.log('Submissions created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Teacher: teacher1@demo.com / password123');
    console.log('Student: student1@demo.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();