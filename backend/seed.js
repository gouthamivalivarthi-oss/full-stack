const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const DEFAULT_MONGODB_URI =
  'mongodb+srv://gouthamivalivarthi_db_user:8ozQKXbosgcVud30@cluster0.midmq3i.mongodb.net/project_collab?retryWrites=true&w=majority&appName=Cluster0';

const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const ProjectMember = require('./models/ProjectMember');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('Cleared existing collections');

    // 1. Create Users
    const password = 'Password123!';

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password,
      role: 'admin',
      bio: 'Lead platform administrator overseeing system governance and infrastructure.',
      skills: ['System Architecture', 'Security', 'DevOps', 'Cloud Databases'],
      phone: '+1 (555) 019-2831',
      status: 'active',
    });

    const manager = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@example.com',
      password,
      role: 'manager',
      bio: 'Senior Software Project Lead specializing in Full-Stack & AI student team mentorship.',
      skills: ['Agile / Scrum', 'React', 'Node.js', 'System Design', 'Project Planning'],
      phone: '+1 (555) 012-9844',
      status: 'active',
    });

    const student = await User.create({
      name: 'Alex Rivera',
      email: 'student@example.com',
      password,
      role: 'student',
      bio: 'Computer Science Undergraduate passionate about Cloud Systems, APIs, and React interfaces.',
      skills: ['React.js', 'JavaScript', 'Tailwind CSS', 'MongoDB', 'Python'],
      phone: '+1 (555) 018-7721',
      status: 'active',
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password,
      role: 'student',
      bio: 'UI/UX enthusiast and frontend specialist building intuitive accessible user experiences.',
      skills: ['Figma', 'UI/UX Design', 'React.js', 'CSS Architecture'],
      phone: '+1 (555) 014-3329',
      status: 'active',
    });

    const david = await User.create({
      name: 'David Chen',
      email: 'david@example.com',
      password,
      role: 'student',
      bio: 'Data Science & Algorithm developer focusing on distributed systems and graph analytics.',
      skills: ['Algorithms', 'Python', 'Node.js', 'Docker', 'RESTful APIs'],
      phone: '+1 (555) 016-5540',
      status: 'active',
    });

    console.log('Seeded Users: Admin, Manager, Student, Priya, David (Password: Password123!)');

    // 2. Create Projects
    const project1 = await Project.create({
      name: 'AI Campus Navigation System',
      description:
        'An intelligent, offline-capable indoor and outdoor mobile navigation platform tailored for university campuses. Features AR wayfinding, accessible routes, and schedule-integrated classroom routing.',
      category: 'Mobile & AI',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'Active',
      priority: 'High',
      owner: manager._id,
      progress: 35,
      tags: ['React', 'Node.js', 'Leaflet', 'AI Wayfinding'],
    });

    const project2 = await Project.create({
      name: 'Sustainable IoT Energy Monitor',
      description:
        'Hardware and web telemetry platform tracking building-level electrical energy usage, generating automated conservation recommendations using machine learning regression models.',
      category: 'IoT & CleanTech',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'Active',
      priority: 'Critical',
      owner: student._id,
      progress: 50,
      tags: ['IoT', 'Analytics', 'Hardware', 'Dashboard'],
    });

    const project3 = await Project.create({
      name: 'Peer Tutoring Collaborative Space',
      description:
        'Interactive real-time tutoring network connecting senior student mentors with junior students for code reviews, math problem sets, and collaborative digital whiteboard sessions.',
      category: 'Web Development',
      startDate: new Date(),
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      status: 'Planning',
      priority: 'Medium',
      owner: manager._id,
      progress: 10,
      tags: ['WebSockets', 'Education', 'FullStack'],
    });

    const project4 = await Project.create({
      name: 'Autonomous Drone Delivery Benchmark',
      description:
        'Completed capstone research measuring battery life and obstacle avoidance telemetry across varying payload weights using simulated and physical quadcopter flights.',
      category: 'Robotics',
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Completed',
      priority: 'High',
      owner: student._id,
      progress: 100,
      tags: ['Robotics', 'Telemetry', 'C++', 'Python'],
    });

    console.log('Seeded Projects: 4 projects created');

    // 3. Project Members
    // Project 1 members
    await ProjectMember.create([
      { project: project1._id, user: manager._id, role: 'Owner' },
      { project: project1._id, user: student._id, role: 'Manager' },
      { project: project1._id, user: priya._id, role: 'Member' },
      { project: project1._id, user: david._id, role: 'Member' },
    ]);

    // Project 2 members
    await ProjectMember.create([
      { project: project2._id, user: student._id, role: 'Owner' },
      { project: project2._id, user: manager._id, role: 'Manager' },
      { project: project2._id, user: david._id, role: 'Member' },
    ]);

    // Project 3 members
    await ProjectMember.create([
      { project: project3._id, user: manager._id, role: 'Owner' },
      { project: project3._id, user: student._id, role: 'Member' },
      { project: project3._id, user: priya._id, role: 'Member' },
    ]);

    // Project 4 members
    await ProjectMember.create([
      { project: project4._id, user: student._id, role: 'Owner' },
      { project: project4._id, user: manager._id, role: 'Member' },
    ]);

    console.log('Seeded Project Members');

    // 4. Tasks for Project 1 (AI Campus Navigation)
    const task1 = await Task.create({
      title: 'Design High-Fidelity Wireframes in Figma',
      description:
        'Create interactive Figma wireframes for main campus overview, floor level switching, accessibility toggles, and step-by-step turn guidance.',
      project: project1._id,
      assignedTo: priya._id,
      createdBy: manager._id,
      priority: 'High',
      status: 'TODO',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    const task2 = await Task.create({
      title: 'Benchmark Pathfinding Algorithms (A* vs Dijkstra)',
      description:
        'Run empirical benchmarks on campus graph with 2,500 nodes. Validate response latency stays under 15ms per routing request.',
      project: project1._id,
      assignedTo: david._id,
      createdBy: manager._id,
      priority: 'Medium',
      status: 'TODO',
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      order: 1,
    });

    const task3 = await Task.create({
      title: 'Implement JWT Authentication & RBAC Middleware',
      description:
        'Implement robust JWT token issuance, cookie handling, role authorization middleware, and protected endpoints for student and manager accounts.',
      project: project1._id,
      assignedTo: student._id,
      createdBy: manager._id,
      priority: 'Critical',
      status: 'IN PROGRESS',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    const task4 = await Task.create({
      title: 'Integrate Mapbox GL JS & Offline Vector Tiles',
      description:
        'Configure vector tile rendering pipeline and cache fallback mechanisms for underground campus tunnel corridors.',
      project: project1._id,
      assignedTo: manager._id,
      createdBy: manager._id,
      priority: 'High',
      status: 'IN PROGRESS',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      order: 1,
    });

    const task5 = await Task.create({
      title: 'Deploy Geolocation MongoDB Geospatial Indexes',
      description:
        'Index building polygons and entrance coordinates using 2dsphere index for ultra-fast nearby lookup queries.',
      project: project1._id,
      assignedTo: student._id,
      createdBy: student._id,
      priority: 'High',
      status: 'REVIEW',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    const task6 = await Task.create({
      title: 'Formulate Architecture Specification & API Contract',
      description:
        'Completed initial technical specification document, OpenAPI schema draft, and database entity-relationship definitions.',
      project: project1._id,
      assignedTo: manager._id,
      createdBy: manager._id,
      priority: 'Medium',
      status: 'COMPLETED',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    // Project 2 Tasks
    await Task.create({
      title: 'Assemble ESP32 Microcontroller Telemetry Unit',
      description: 'Solder current transformer sensors to analog inputs and calibrate voltage readings.',
      project: project2._id,
      assignedTo: student._id,
      createdBy: student._id,
      priority: 'High',
      status: 'COMPLETED',
      deadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    await Task.create({
      title: 'Build Live MQTT Ingestion Gateway',
      description: 'Create Node.js microservice to ingest high-frequency power spikes into MongoDB Atlas.',
      project: project2._id,
      assignedTo: david._id,
      createdBy: student._id,
      priority: 'Critical',
      status: 'IN PROGRESS',
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      order: 0,
    });

    console.log('Seeded Tasks across projects');

    // 5. Comments on Task 3
    await Comment.create([
      {
        task: task3._id,
        user: manager._id,
        message:
          'Alex, make sure we use bcrypt with 10 salt rounds and reject tokens with mismatched signatures promptly.',
      },
      {
        task: task3._id,
        user: student._id,
        message:
          'Understood Sarah! Implemented in the middleware, and added tests for expired JWT payloads as well.',
      },
      {
        task: task3._id,
        user: manager._id,
        message:
          'Excellent progress. Once PR is open, ping me and I will merge it into the dev branch.',
      },
    ]);

    console.log('Seeded Comments');

    // 6. Notifications
    await Notification.create([
      {
        user: student._id,
        type: 'task_assignment',
        message: 'Sarah Jenkins assigned you the task "Implement JWT Authentication & RBAC Middleware"',
        relatedProject: project1._id,
        relatedTask: task3._id,
        isRead: false,
      },
      {
        user: student._id,
        type: 'comment',
        message: 'Sarah Jenkins commented on "Implement JWT Authentication & RBAC Middleware"',
        relatedProject: project1._id,
        relatedTask: task3._id,
        isRead: false,
      },
      {
        user: manager._id,
        type: 'task_status',
        message: 'Alex Rivera moved "Deploy Geolocation MongoDB Geospatial Indexes" to REVIEW',
        relatedProject: project1._id,
        relatedTask: task5._id,
        isRead: false,
      },
      {
        user: admin._id,
        type: 'system',
        message: 'System cluster initialized with 4 active project workspaces.',
        isRead: false,
      },
    ]);

    console.log('Seeded Notifications');

    // 7. Activity Logs
    await ActivityLog.create([
      {
        project: project1._id,
        user: manager._id,
        action: 'project_created',
        details: 'Project "AI Campus Navigation System" created by Sarah Jenkins',
      },
      {
        project: project1._id,
        user: manager._id,
        action: 'member_joined',
        details: 'Alex Rivera was added as Project Manager',
      },
      {
        project: project1._id,
        user: manager._id,
        action: 'task_created',
        details: 'Task "Implement JWT Authentication & RBAC Middleware" created by Sarah Jenkins',
      },
      {
        project: project1._id,
        user: student._id,
        action: 'task_status_changed',
        details: 'Task "Deploy Geolocation MongoDB Geospatial Indexes" moved to REVIEW by Alex Rivera',
      },
      {
        project: project1._id,
        user: manager._id,
        action: 'task_completed',
        details: 'Task "Formulate Architecture Specification & API Contract" marked as COMPLETED',
      },
    ]);

    // 8. Direct Chat Conversation between Manager and Student
    const conv = await Conversation.create({
      participants: [manager._id, student._id],
    });

    const msg1 = await Message.create({
      sender: manager._id,
      recipient: student._id,
      conversation: conv._id,
      content:
        'Hi Alex! Welcome to the team. Could you check the task board and let me know if the milestone deadline works for you?',
      isRead: true,
      readAt: new Date(Date.now() - 3600000),
    });

    const msg2 = await Message.create({
      sender: student._id,
      recipient: manager._id,
      conversation: conv._id,
      content:
        'Hey Sarah! Yes, the timeline looks very solid. I am finishing up the authentication module right now.',
      isRead: true,
      readAt: new Date(Date.now() - 1800000),
    });

    const msg3 = await Message.create({
      sender: manager._id,
      recipient: student._id,
      conversation: conv._id,
      content:
        'Awesome work! Once that is ready, we can run the end-to-end integration tests together.',
      isRead: false,
    });

    conv.lastMessage = msg3._id;
    await conv.save();

    console.log('Seeded Conversation and Messages');
    console.log('----------------------------------------------------');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('1. Admin:   admin@example.com   / Password123!');
    console.log('2. Manager: manager@example.com / Password123!');
    console.log('3. Student: student@example.com / Password123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
