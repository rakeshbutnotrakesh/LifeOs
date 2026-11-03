/**
 * LifeOS TypeScript Types
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

// Study Module
export type ChapterStatus = 'not_started' | 'in_progress' | 'completed';

export interface Chapter {
  id: string;
  title: string;
  status: ChapterStatus;
  notes?: string;
  revisionCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  credits: number;
  instructor?: string;
  targetGrade?: string;
  chapters: Chapter[];
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  syllabus?: string;
  totalMarks?: number;
  obtainedMarks?: number;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  subjectId: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
}

export interface GradeEntry {
  id: string;
  subjectId: string;
  credits: number;
  gradePoint: number; // e.g. 10, 9, 8, etc.
  letterGrade: string; // e.g. O, A+, A, B+, B, C
}

// Personal Finance Module
export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Education'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod?: string;
}

// Habits Module
export type HabitCategory = 'health' | 'study' | 'productivity' | 'mindfulness' | 'fitness' | 'other';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  color: string;
  iconName?: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  targetPerDay: number; // e.g. 1
  unit?: string; // e.g. "times", "mins", "pages"
  history: Record<string, boolean>; // key is YYYY-MM-DD
  createdAt: string;
}

// Goals Module
export type GoalCategory = 'academic' | 'career' | 'personal' | 'financial' | 'health';
export type GoalTerm = 'short_term' | 'long_term';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  term: GoalTerm;
  priority: Priority;
  deadline: string; // YYYY-MM-DD
  milestones: Milestone[];
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

// Calendar & Schedule
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  category: 'event' | 'task' | 'exam' | 'reminder';
  color?: string;
  location?: string;
  reminderMinutesBefore?: number;
}

// Notes & Journal
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type JournalMood = 'great' | 'good' | 'neutral' | 'low' | 'stressed';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: JournalMood;
  energyLevel: number; // 1 to 5
  reflection: string;
  achievements: string[];
  improvements: string[];
  createdAt: string;
}

// User Settings
export interface UserProfile {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export type DashboardWidgetId =
  | 'stats'
  | 'tasks'
  | 'schedule'
  | 'habits'
  | 'finance'
  | 'study'
  | 'goals'
  | 'analytics_preview';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  name: string;
  visible: boolean;
  order: number;
}

export interface AppSettings {
  profile: UserProfile;
  theme: 'dark' | 'light';
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  monthlyBudget: number;
  weekStart: 'Monday' | 'Sunday';
  notificationsEnabled: boolean;
  dashboardWidgets: DashboardWidgetConfig[];
}

export interface LifeOSData {
  tasks: Task[];
  subjects: Subject[];
  exams: Exam[];
  assignments: Assignment[];
  timetable: TimetableEntry[];
  grades: GradeEntry[];
  transactions: Transaction[];
  habits: Habit[];
  goals: Goal[];
  events: CalendarEvent[];
  notes: Note[];
  journals: JournalEntry[];
  settings: AppSettings;
  version: number;
}
