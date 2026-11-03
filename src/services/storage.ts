/**
 * LifeOS Local Storage Service
 * Handles persistence, initial seeding, export, import, and backup.
 */

import { LifeOSData, AppSettings } from '../types';

const STORAGE_KEY = 'lifeos_app_data_v1';

// Helper to get formatted date string for relative days
const formatDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    name: 'Alex Rivera',
    avatar: 'AR',
    role: 'Computer Science Student & Freelancer',
    bio: 'Continuous learner. Building systems that make life simpler and focused.',
  },
  theme: 'dark',
  currency: 'INR',
  currencySymbol: '₹',
  monthlyBudget: 25000,
  weekStart: 'Monday',
  notificationsEnabled: false,
  dashboardWidgets: [
    { id: 'stats', name: 'Quick Metrics', visible: true, order: 0 },
    { id: 'tasks', name: "Today's Tasks", visible: true, order: 1 },
    { id: 'schedule', name: "Today's Schedule & Deadlines", visible: true, order: 2 },
    { id: 'habits', name: 'Daily Habits Check-in', visible: true, order: 3 },
    { id: 'finance', name: 'Monthly Financial Pulse', visible: true, order: 4 },
    { id: 'study', name: 'Academic & Exam Countdown', visible: true, order: 5 },
    { id: 'goals', name: 'Active Goals Progress', visible: true, order: 6 },
    { id: 'analytics_preview', name: 'Productivity Trend', visible: true, order: 7 },
  ],
};

export const getInitialDemoData = (): LifeOSData => {
  const today = formatDate(0);
  const yesterday = formatDate(-1);
  const dayBefore = formatDate(-2);
  const tomorrow = formatDate(1);
  const in3Days = formatDate(3);
  const in7Days = formatDate(7);
  const in14Days = formatDate(14);
  const in21Days = formatDate(21);

  // Past 14 days dates for habit history
  const habitHistoryDays: string[] = [];
  for (let i = 0; i < 28; i++) {
    habitHistoryDays.push(formatDate(-i));
  }

  return {
    version: 1,
    settings: DEFAULT_SETTINGS,
    tasks: [
      {
        id: 't-1',
        title: 'Complete Distributed Systems Lab Report',
        description: 'Implement Raft consensus algorithm simulation and submit benchmark results.',
        priority: 'urgent',
        status: 'in_progress',
        category: 'Study',
        dueDate: today,
        dueTime: '18:00',
        subtasks: [
          { id: 'st-1', title: 'Write node failure recovery test', completed: true },
          { id: 'st-2', title: 'Plot latency vs quorum size graph', completed: true },
          { id: 'st-3', title: 'Review conclusion with team', completed: false },
        ],
        createdAt: formatDate(-3),
      },
      {
        id: 't-2',
        title: 'Review Machine Learning Chapter 4 (Neural Nets)',
        description: 'Backpropagation calculus derivation & loss function derivations.',
        priority: 'high',
        status: 'todo',
        category: 'Study',
        dueDate: tomorrow,
        dueTime: '14:00',
        subtasks: [
          { id: 'st-4', title: 'Gradient descent proofs', completed: false },
          { id: 'st-5', title: 'Work through problem set 3', completed: false },
        ],
        createdAt: formatDate(-2),
      },
      {
        id: 't-3',
        title: 'Submit monthly rent & electricity bill',
        description: 'Transfer INR 9,500 for rent and 1,200 for power utilities.',
        priority: 'high',
        status: 'completed',
        category: 'Personal',
        dueDate: today,
        dueTime: '11:00',
        subtasks: [],
        createdAt: formatDate(-4),
        completedAt: today,
      },
      {
        id: 't-4',
        title: 'Refactor portfolio website with React & Tailwind',
        description: 'Clean up mobile layout and add project case studies.',
        priority: 'medium',
        status: 'in_progress',
        category: 'Projects',
        dueDate: in7Days,
        subtasks: [
          { id: 'st-6', title: 'Design project detail drawer', completed: true },
          { id: 'st-7', title: 'Optimize lighthouse score > 95', completed: false },
        ],
        createdAt: formatDate(-5),
      },
      {
        id: 't-5',
        title: 'Buy groceries: vegetables, oats & protein powder',
        description: 'Check local market discount before 8 PM.',
        priority: 'low',
        status: 'todo',
        category: 'Personal',
        dueDate: today,
        dueTime: '19:30',
        subtasks: [],
        createdAt: formatDate(-1),
      },
      {
        id: 't-6',
        title: 'Database Systems Midterm Exam Preparation',
        description: 'Relational algebra, B+ Trees indexing and 3NF normalization.',
        priority: 'urgent',
        status: 'todo',
        category: 'Study',
        dueDate: in3Days,
        subtasks: [
          { id: 'st-8', title: 'Solve 2024 past papers', completed: true },
          { id: 'st-9', title: 'Review B+ Tree deletion algorithm', completed: false },
          { id: 'st-10', title: 'Study transaction isolation levels (ACID)', completed: false },
        ],
        createdAt: formatDate(-6),
      },
      {
        id: 't-7',
        title: 'Push Weekly GitHub Commit for Open Source Tool',
        description: 'Fixed issue #42 regarding timezone offset parsing.',
        priority: 'low',
        status: 'completed',
        category: 'Career',
        dueDate: yesterday,
        subtasks: [],
        createdAt: formatDate(-3),
        completedAt: yesterday,
      },
    ],
    subjects: [
      {
        id: 'sub-1',
        name: 'Database Management Systems',
        code: 'CS-401',
        color: '#6366f1', // Indigo
        credits: 4,
        instructor: 'Dr. Ramesh Sharma',
        targetGrade: 'A+',
        chapters: [
          { id: 'ch-1', title: 'Relational Model & SQL', status: 'completed', revisionCount: 3 },
          { id: 'ch-2', title: 'Indexing & B+ Trees', status: 'in_progress', revisionCount: 2 },
          { id: 'ch-3', title: 'Transactions & Concurrency Control', status: 'not_started', revisionCount: 0 },
          { id: 'ch-4', title: 'Query Optimization & Crash Recovery', status: 'not_started', revisionCount: 0 },
        ],
      },
      {
        id: 'sub-2',
        name: 'Distributed Systems',
        code: 'CS-405',
        color: '#10b981', // Emerald
        credits: 4,
        instructor: 'Prof. Sarah Jenkins',
        targetGrade: 'O',
        chapters: [
          { id: 'ch-5', title: 'Clock Synchronization & Logical Clocks', status: 'completed', revisionCount: 2 },
          { id: 'ch-6', title: 'Consensus Protocols (Paxos & Raft)', status: 'in_progress', revisionCount: 1 },
          { id: 'ch-7', title: 'Distributed Hash Tables (DHT)', status: 'not_started', revisionCount: 0 },
        ],
      },
      {
        id: 'sub-3',
        name: 'Machine Learning',
        code: 'AI-302',
        color: '#f59e0b', // Amber
        credits: 3,
        instructor: 'Dr. Vivek Nair',
        targetGrade: 'A',
        chapters: [
          { id: 'ch-8', title: 'Linear Models & Regularization', status: 'completed', revisionCount: 2 },
          { id: 'ch-9', title: 'Support Vector Machines', status: 'completed', revisionCount: 1 },
          { id: 'ch-10', title: 'Neural Networks & Deep Learning', status: 'in_progress', revisionCount: 1 },
          { id: 'ch-11', title: 'Unsupervised Learning & Clustering', status: 'not_started', revisionCount: 0 },
        ],
      },
      {
        id: 'sub-4',
        name: 'Design & Analysis of Algorithms',
        code: 'CS-301',
        color: '#ec4899', // Pink
        credits: 4,
        instructor: 'Prof. Anita Roy',
        targetGrade: 'O',
        chapters: [
          { id: 'ch-12', title: 'Divide and Conquer & Recurrences', status: 'completed', revisionCount: 3 },
          { id: 'ch-13', title: 'Dynamic Programming', status: 'completed', revisionCount: 4 },
          { id: 'ch-14', title: 'Graph Algorithms & Flow Networks', status: 'completed', revisionCount: 2 },
          { id: 'ch-15', title: 'NP-Completeness & Approximations', status: 'in_progress', revisionCount: 1 },
        ],
      },
    ],
    exams: [
      {
        id: 'ex-1',
        title: 'DBMS Mid-Semester Examination',
        subjectId: 'sub-1',
        date: in3Days,
        time: '10:00 - 12:00',
        location: 'Hall B, Room 204',
        syllabus: 'Chapters 1, 2 (Relational Model, SQL, B+ Trees)',
        totalMarks: 50,
      },
      {
        id: 'ex-2',
        title: 'Machine Learning Practical & Viva',
        subjectId: 'sub-3',
        date: in14Days,
        time: '14:00 - 17:00',
        location: 'AI Research Lab 2',
        syllabus: 'SVM, Logistic Regression, PyTorch CNN implementation',
        totalMarks: 30,
      },
      {
        id: 'ex-3',
        title: 'Distributed Systems Final Examination',
        subjectId: 'sub-2',
        date: in21Days,
        time: '09:30 - 12:30',
        location: 'Main Auditorium',
        syllabus: 'Entire Semester Syllabus',
        totalMarks: 100,
      },
    ],
    assignments: [
      {
        id: 'as-1',
        title: 'Raft Protocol Implementation',
        subjectId: 'sub-2',
        dueDate: tomorrow,
        status: 'pending',
        maxScore: 20,
      },
      {
        id: 'as-2',
        title: 'SQL Complex Queries & Index Benchmarks',
        subjectId: 'sub-1',
        dueDate: yesterday,
        status: 'graded',
        score: 19,
        maxScore: 20,
      },
      {
        id: 'as-3',
        title: 'CIFAR-10 Classification with PyTorch',
        subjectId: 'sub-3',
        dueDate: in7Days,
        status: 'pending',
        maxScore: 25,
      },
    ],
    timetable: [
      { id: 'tt-1', day: 'Monday', subjectId: 'sub-1', startTime: '09:00', endTime: '10:30', room: 'LH-1' },
      { id: 'tt-2', day: 'Monday', subjectId: 'sub-2', startTime: '11:00', endTime: '12:30', room: 'LH-3' },
      { id: 'tt-3', day: 'Tuesday', subjectId: 'sub-3', startTime: '10:00', endTime: '11:30', room: 'Lab-A' },
      { id: 'tt-4', day: 'Wednesday', subjectId: 'sub-1', startTime: '09:00', endTime: '10:30', room: 'LH-1' },
      { id: 'tt-5', day: 'Wednesday', subjectId: 'sub-4', startTime: '14:00', endTime: '15:30', room: 'LH-2' },
      { id: 'tt-6', day: 'Thursday', subjectId: 'sub-2', startTime: '11:00', endTime: '12:30', room: 'LH-3' },
      { id: 'tt-7', day: 'Friday', subjectId: 'sub-3', startTime: '09:30', endTime: '11:00', room: 'LH-4' },
      { id: 'tt-8', day: 'Friday', subjectId: 'sub-4', startTime: '11:30', endTime: '13:00', room: 'LH-2' },
    ],
    grades: [
      { id: 'gr-1', subjectId: 'sub-1', credits: 4, gradePoint: 9, letterGrade: 'A+' },
      { id: 'gr-2', subjectId: 'sub-2', credits: 4, gradePoint: 10, letterGrade: 'O' },
      { id: 'gr-3', subjectId: 'sub-3', credits: 3, gradePoint: 9, letterGrade: 'A+' },
      { id: 'gr-4', subjectId: 'sub-4', credits: 4, gradePoint: 10, letterGrade: 'O' },
    ],
    transactions: [
      {
        id: 'tx-1',
        type: 'income',
        amount: 32000,
        category: 'Freelance & Stipend',
        date: formatDate(-5),
        note: 'Web application frontend contract milestone',
        paymentMethod: 'Bank Transfer',
      },
      {
        id: 'tx-2',
        type: 'expense',
        amount: 9500,
        category: 'Bills',
        date: today,
        note: 'Monthly Apartment Rent',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-3',
        type: 'expense',
        amount: 1850,
        category: 'Food',
        date: formatDate(-1),
        note: 'Weekly groceries from supermarket',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-4',
        type: 'expense',
        amount: 850,
        category: 'Education',
        date: formatDate(-3),
        note: 'Textbook: Operating Systems Concepts',
        paymentMethod: 'Credit Card',
      },
      {
        id: 'tx-5',
        type: 'expense',
        amount: 420,
        category: 'Transport',
        date: formatDate(-2),
        note: 'Metro card top-up',
        paymentMethod: 'Metro App',
      },
      {
        id: 'tx-6',
        type: 'expense',
        amount: 1200,
        category: 'Bills',
        date: today,
        note: 'Electricity and high-speed Wi-Fi',
        paymentMethod: 'NetBanking',
      },
      {
        id: 'tx-7',
        type: 'expense',
        amount: 650,
        category: 'Entertainment',
        date: formatDate(-4),
        note: 'Cinema tickets with college friends',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-8',
        type: 'expense',
        amount: 380,
        category: 'Healthcare',
        date: formatDate(-6),
        note: 'Vitamins & first-aid replenishment',
        paymentMethod: 'Cash',
      },
      {
        id: 'tx-9',
        type: 'income',
        amount: 5000,
        category: 'Scholarship',
        date: formatDate(-12),
        note: 'Merit scholarship semester credit',
        paymentMethod: 'Direct Deposit',
      },
    ],
    habits: [
      {
        id: 'h-1',
        name: 'Deep Study (Focus 2+ Hours)',
        category: 'study',
        color: '#6366f1',
        iconName: 'BookOpen',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'sessions',
        history: {
          [today]: true,
          [yesterday]: true,
          [dayBefore]: true,
          [formatDate(-3)]: true,
          [formatDate(-4)]: true,
          [formatDate(-5)]: false,
          [formatDate(-6)]: true,
          [formatDate(-7)]: true,
          [formatDate(-8)]: true,
        },
        createdAt: formatDate(-30),
      },
      {
        id: 'h-2',
        name: 'Morning Workout & Jog',
        category: 'fitness',
        color: '#10b981',
        iconName: 'Activity',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'workout',
        history: {
          [today]: true,
          [yesterday]: true,
          [dayBefore]: false,
          [formatDate(-3)]: true,
          [formatDate(-4)]: true,
          [formatDate(-5)]: true,
          [formatDate(-6)]: true,
        },
        createdAt: formatDate(-30),
      },
      {
        id: 'h-3',
        name: 'Solve 1 LeetCode Problem',
        category: 'productivity',
        color: '#f59e0b',
        iconName: 'Code',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'problem',
        history: {
          [today]: false,
          [yesterday]: true,
          [dayBefore]: true,
          [formatDate(-3)]: true,
          [formatDate(-4)]: false,
          [formatDate(-5)]: true,
        },
        createdAt: formatDate(-30),
      },
      {
        id: 'h-4',
        name: 'Hydration (3 Litres Water)',
        category: 'health',
        color: '#06b6d4',
        iconName: 'Droplet',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'litres',
        history: {
          [today]: true,
          [yesterday]: true,
          [dayBefore]: true,
          [formatDate(-3)]: true,
          [formatDate(-4)]: true,
          [formatDate(-5)]: true,
          [formatDate(-6)]: true,
        },
        createdAt: formatDate(-30),
      },
      {
        id: 'h-5',
        name: 'Read Non-Fiction Book (20 Pages)',
        category: 'mindfulness',
        color: '#8b5cf6',
        iconName: 'BookMarked',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'pages',
        history: {
          [today]: false,
          [yesterday]: true,
          [dayBefore]: true,
          [formatDate(-3)]: false,
          [formatDate(-4)]: true,
          [formatDate(-5)]: true,
        },
        createdAt: formatDate(-30),
      },
      {
        id: 'h-6',
        name: 'Sleep by 11:30 PM',
        category: 'health',
        color: '#3b82f6',
        iconName: 'Moon',
        frequency: 'daily',
        targetPerDay: 1,
        unit: 'night',
        history: {
          [yesterday]: true,
          [dayBefore]: true,
          [formatDate(-3)]: true,
          [formatDate(-4)]: false,
        },
        createdAt: formatDate(-30),
      },
    ],
    goals: [
      {
        id: 'g-1',
        title: 'Maintain 9.5+ SGPA this Semester',
        description: 'Consistent daily chapter revisions, score 90%+ in midterms & projects.',
        category: 'academic',
        term: 'short_term',
        priority: 'urgent',
        deadline: in21Days,
        milestones: [
          { id: 'm-1', title: 'A+ in DBMS Lab & Midterm', completed: true },
          { id: 'm-2', title: 'Complete Distributed Systems Raft Project', completed: true },
          { id: 'm-3', title: 'Top score in Algorithms final test', completed: false },
          { id: 'm-4', title: 'Submit all assignment work on time', completed: false },
        ],
        notes: 'Targeting Dean Merit List and research fellowship nomination.',
        completed: false,
        createdAt: formatDate(-45),
      },
      {
        id: 'g-2',
        title: 'Build and Launch Full-Stack SaaS Portfolio Product',
        description: 'Develop a modern productivity tool that demonstrates systems architecture skills.',
        category: 'career',
        term: 'short_term',
        priority: 'high',
        deadline: in14Days,
        milestones: [
          { id: 'm-5', title: 'Finalize UI design system and responsive tokens', completed: true },
          { id: 'm-6', title: 'Wire up local offline persistence engine', completed: true },
          { id: 'm-7', title: 'Write comprehensive integration tests', completed: false },
          { id: 'm-8', title: 'Publish public demo and documentation', completed: false },
        ],
        notes: 'Showcase in upcoming software engineering campus interviews.',
        completed: false,
        createdAt: formatDate(-30),
      },
      {
        id: 'g-3',
        title: 'Emergency Fund: Save ₹50,000',
        description: 'Keep a safety reserve in high-interest liquid savings account.',
        category: 'financial',
        term: 'long_term',
        priority: 'medium',
        deadline: formatDate(90),
        milestones: [
          { id: 'm-9', title: 'Reached ₹15,000 saved', completed: true },
          { id: 'm-10', title: 'Reached ₹30,000 saved', completed: true },
          { id: 'm-11', title: 'Reach ₹45,000 milestone', completed: false },
          { id: 'm-12', title: 'Full ₹50,000 funded', completed: false },
        ],
        notes: 'Auto-allocate 30% of freelance income upon invoice payment.',
        completed: false,
        createdAt: formatDate(-60),
      },
      {
        id: 'g-4',
        title: 'Run a 10K Marathon in under 55 Minutes',
        description: 'Gradual weekly volume progression and interval sprints.',
        category: 'health',
        term: 'long_term',
        priority: 'medium',
        deadline: formatDate(60),
        milestones: [
          { id: 'm-13', title: 'Complete 5K without walking', completed: true },
          { id: 'm-14', title: 'Hit 7.5K benchmark in under 42 min', completed: false },
          { id: 'm-15', title: 'Official 10K race completion', completed: false },
        ],
        completed: false,
        createdAt: formatDate(-20),
      },
    ],
    events: [
      {
        id: 'ev-1',
        title: 'Algorithms Group Study Session',
        description: 'Discussing dynamic programming optimization techniques with Alex & Priya.',
        startDate: today,
        startTime: '15:30',
        endDate: today,
        endTime: '17:00',
        category: 'task',
        color: '#6366f1',
        location: 'Library Discussion Room 3',
        reminderMinutesBefore: 15,
      },
      {
        id: 'ev-2',
        title: 'DBMS Mid-Semester Exam',
        description: 'Room 204. Carry student ID card and scientific calculator.',
        startDate: in3Days,
        startTime: '10:00',
        endDate: in3Days,
        endTime: '12:00',
        category: 'exam',
        color: '#ef4444',
        location: 'Academic Hall B',
        reminderMinutesBefore: 60,
      },
      {
        id: 'ev-3',
        title: 'Distributed Systems Project Demo to Prof. Jenkins',
        description: '10 minute presentation + 5 minute code walkthrough.',
        startDate: tomorrow,
        startTime: '14:00',
        endDate: tomorrow,
        endTime: '14:30',
        category: 'event',
        color: '#10b981',
        location: 'Faculty Cabin 12',
        reminderMinutesBefore: 30,
      },
      {
        id: 'ev-4',
        title: 'Monthly Budget Reconciliation',
        description: 'Verify bills and categorize any cash receipts.',
        startDate: today,
        startTime: '20:00',
        endDate: today,
        endTime: '20:30',
        category: 'reminder',
        color: '#f59e0b',
        reminderMinutesBefore: 10,
      },
    ],
    notes: [
      {
        id: 'n-1',
        title: 'DBMS Key Formulas & Normalization Rules',
        content: `### Normalization Quick Reference:
- **1NF**: Atomic attribute values; no repeating groups.
- **2NF**: In 1NF and no partial dependencies (every non-key depends on full candidate key).
- **3NF**: In 2NF and no transitive dependencies ($X \\to A$, then either $X$ is superkey or $A$ is prime).
- **BCNF**: For every functional dependency $X \\to A$, $X$ must be a superkey!

### B+ Tree Characteristics:
- Order $m$: Every node except root has between $\\lceil m/2 \\rceil$ and $m$ children.
- Leaf nodes form a doubly linked list for fast range scanning.`,
        tags: ['CS-401', 'DBMS', 'Exam Prep'],
        isPinned: true,
        color: '#6366f1',
        createdAt: formatDate(-5),
        updatedAt: formatDate(-1),
      },
      {
        id: 'n-2',
        title: 'Freelance Client Project Roadmap & Milestones',
        content: `### Deliverables Checklist:
- [x] Responsive layout with dark mode support
- [x] Form validation with accessible error state
- [ ] Export to PDF & CSV
- [ ] Staging deployment link for review

**Client Feedback**: Requested larger metric badges and clearer contrast on hover cards.`,
        tags: ['Work', 'Freelance', 'Client'],
        isPinned: true,
        color: '#10b981',
        createdAt: formatDate(-8),
        updatedAt: formatDate(-2),
      },
      {
        id: 'n-3',
        title: 'Personal Philosophy: Principles of High Leverage',
        content: `1. **Time Blocking**: Dedicate 9:00 AM to 12:00 PM purely to high-cognition deep work.
2. **Eliminate Friction**: Prepare study desk and clothes the night before.
3. **Compound Consistency**: Doing 20 focused minutes every single day crushes 5 hours of chaotic cramming.
4. **Health is Foundation**: 7.5 hours of solid sleep makes 4 hours of coding equal 8 hours of fatigued work.`,
        tags: ['Productivity', 'Mindset'],
        isPinned: false,
        color: '#8b5cf6',
        createdAt: formatDate(-15),
        updatedAt: formatDate(-10),
      },
    ],
    journals: [
      {
        id: 'j-1',
        date: today,
        mood: 'great',
        energyLevel: 5,
        reflection:
          'Had an extremely productive morning session. Completed the Raft consensus failure tests ahead of schedule. The campus weather was refreshing.',
        achievements: [
          'Passed all distributed systems test cases',
          'Completed morning 5K workout with good cadence',
          'Stayed 100% within daily food budget',
        ],
        improvements: [
          'Take a short 5-minute break every hour away from the laptop screen',
          'Read the machine learning research paper before bedtime',
        ],
        createdAt: today,
      },
      {
        id: 'j-2',
        date: yesterday,
        mood: 'good',
        energyLevel: 4,
        reflection:
          'Solid day overall. Revised two entire chapters of Database Systems. Met up with study group to review past paper queries.',
        achievements: [
          'Solved 10 complex B+ tree insertion & deletion questions',
          'Drink 3L of water goal achieved easily',
        ],
        improvements: [
          'Avoid checking notifications when in the middle of a coding block',
        ],
        createdAt: yesterday,
      },
    ],
  };
};

export const loadLifeOSData = (): LifeOSData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoData();
      saveLifeOSData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as LifeOSData;
    // Basic validation to ensure required arrays exist
    if (!parsed.tasks || !parsed.subjects || !parsed.settings) {
      const fallback = getInitialDemoData();
      saveLifeOSData(fallback);
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse LifeOS data from localStorage:', e);
    const initial = getInitialDemoData();
    saveLifeOSData(initial);
    return initial;
  }
};

export const saveLifeOSData = (data: LifeOSData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save LifeOS data to localStorage:', e);
  }
};

export const exportDataAsJSON = (data: LifeOSData): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `lifeos-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importDataFromJSON = async (file: File): Promise<LifeOSData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as LifeOSData;
        if (!parsed.tasks || !parsed.settings || !parsed.subjects) {
          throw new Error('Invalid LifeOS backup file format: missing critical modules.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file.'));
    reader.readAsText(file);
  });
};

export const resetToDemoData = (): LifeOSData => {
  const demoData = getInitialDemoData();
  saveLifeOSData(demoData);
  return demoData;
};

export const clearAllData = (): LifeOSData => {
  const emptyData: LifeOSData = {
    version: 1,
    settings: DEFAULT_SETTINGS,
    tasks: [],
    subjects: [],
    exams: [],
    assignments: [],
    timetable: [],
    grades: [],
    transactions: [],
    habits: [],
    goals: [],
    events: [],
    notes: [],
    journals: [],
  };
  saveLifeOSData(emptyData);
  return emptyData;
};
