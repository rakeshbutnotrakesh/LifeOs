/**
 * LifeOS Central Application Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  LifeOSData,
  Task,
  Subject,
  Exam,
  Assignment,
  TimetableEntry,
  GradeEntry,
  Transaction,
  Habit,
  Goal,
  CalendarEvent,
  Note,
  JournalEntry,
  AppSettings,
  DashboardWidgetConfig,
  UserProfile,
} from '../types';
import {
  loadLifeOSData,
  saveLifeOSData,
  exportDataAsJSON,
  importDataFromJSON,
  resetToDemoData,
  clearAllData,
} from '../services/storage';

export type NavTab =
  | 'dashboard'
  | 'tasks'
  | 'study'
  | 'finance'
  | 'habits'
  | 'goals'
  | 'calendar'
  | 'notes'
  | 'analytics'
  | 'settings';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  data: LifeOSData;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;

  // Search & Quick Add
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialType?: 'task' | 'transaction' | 'habit' | 'goal' | 'event' | 'note';
  openQuickAdd: (type?: 'task' | 'transaction' | 'habit' | 'goal' | 'event' | 'note') => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Study actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  toggleChapterStatus: (subjectId: string, chapterId: string) => void;
  incrementRevision: (subjectId: string, chapterId: string) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  updateGrades: (grades: GradeEntry[]) => void;

  // Finance actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'history' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, dateStr: string) => void;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  toggleGoalCompleted: (id: string) => void;

  // Calendar actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Notes & Journal actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  saveJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  deleteJournalEntry: (id: string) => void;

  // Settings & Data actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleWidgetVisibility: (id: string) => void;
  updateWidgetOrder: (widgets: DashboardWidgetConfig[]) => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<boolean>;
  resetDemo: () => void;
  clearAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LifeOSData>(() => loadLifeOSData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<
    'task' | 'transaction' | 'habit' | 'goal' | 'event' | 'note' | undefined
  >('task');

  // Sync to local storage on change
  useEffect(() => {
    saveLifeOSData(data);
  }, [data]);

  // Handle HTML document theme class
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.theme]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  };

  const openQuickAdd = (type: 'task' | 'transaction' | 'habit' | 'goal' | 'event' | 'note' = 'task') => {
    setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  };

  // --- Task Operations ---
  const addTask = (taskInput: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskInput,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    addToast('Task created successfully!');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    addToast('Task updated');
  };

  const deleteTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    addToast('Task deleted', 'info');
  };

  const toggleTaskCompleted = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          if (nextStatus === 'completed') {
            triggerConfetti();
          }
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      }),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // If all subtasks are completed, prompt completion
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      }),
    }));
  };

  // --- Study Operations ---
  const addSubject = (subjectInput: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectInput,
      id: 'sub-' + Date.now(),
    };
    setData((prev) => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
    addToast('Subject added');
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    addToast('Subject updated');
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      exams: prev.exams.filter((e) => e.subjectId !== id),
      assignments: prev.assignments.filter((a) => a.subjectId !== id),
      timetable: prev.timetable.filter((t) => t.subjectId !== id),
      grades: prev.grades.filter((g) => g.subjectId !== id),
    }));
    addToast('Subject and related items removed', 'info');
  };

  const toggleChapterStatus = (subjectId: string, chapterId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          chapters: sub.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch;
            const nextStatus =
              ch.status === 'not_started'
                ? 'in_progress'
                : ch.status === 'in_progress'
                ? 'completed'
                : 'not_started';
            if (nextStatus === 'completed') triggerConfetti();
            return { ...ch, status: nextStatus };
          }),
        };
      }),
    }));
  };

  const incrementRevision = (subjectId: string, chapterId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          chapters: sub.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, revisionCount: (ch.revisionCount || 0) + 1 } : ch
          ),
        };
      }),
    }));
    addToast('Revision count updated! 🎯');
  };

  const addExam = (examInput: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...examInput, id: 'ex-' + Date.now() };
    setData((prev) => ({ ...prev, exams: [...prev.exams, newExam] }));
    addToast('Exam scheduled');
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    addToast('Exam details updated');
  };

  const deleteExam = (id: string) => {
    setData((prev) => ({ ...prev, exams: prev.exams.filter((e) => e.id !== id) }));
    addToast('Exam deleted', 'info');
  };

  const addAssignment = (asgnInput: Omit<Assignment, 'id'>) => {
    const newAsgn: Assignment = { ...asgnInput, id: 'as-' + Date.now() };
    setData((prev) => ({ ...prev, assignments: [...prev.assignments, newAsgn] }));
    addToast('Assignment added');
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    addToast('Assignment updated');
  };

  const deleteAssignment = (id: string) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
    addToast('Assignment deleted', 'info');
  };

  const addTimetableEntry = (entryInput: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = { ...entryInput, id: 'tt-' + Date.now() };
    setData((prev) => ({ ...prev, timetable: [...prev.timetable, newEntry] }));
    addToast('Timetable class added');
  };

  const deleteTimetableEntry = (id: string) => {
    setData((prev) => ({ ...prev, timetable: prev.timetable.filter((t) => t.id !== id) }));
    addToast('Class removed from schedule', 'info');
  };

  const updateGrades = (grades: GradeEntry[]) => {
    setData((prev) => ({ ...prev, grades }));
    addToast('Academic grades updated! SGPA recalculated.');
  };

  // --- Finance Operations ---
  const addTransaction = (txInput: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...txInput, id: 'tx-' + Date.now() };
    setData((prev) => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    addToast(`${txInput.type === 'income' ? 'Income' : 'Expense'} recorded`);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
    }));
    addToast('Transaction updated');
  };

  const deleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
    addToast('Transaction deleted', 'info');
  };

  // --- Habit Operations ---
  const addHabit = (habitInput: Omit<Habit, 'id' | 'history' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitInput,
      id: 'h-' + Date.now(),
      history: {},
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({ ...prev, habits: [...prev.habits, newHabit] }));
    addToast('Habit tracker started! 🌟');
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    addToast('Habit updated');
  };

  const deleteHabit = (id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }));
    addToast('Habit removed', 'info');
  };

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const current = !!h.history[dateStr];
        const next = !current;
        if (next) triggerConfetti();
        return {
          ...h,
          history: {
            ...h.history,
            [dateStr]: next,
          },
        };
      }),
    }));
  };

  // --- Goal Operations ---
  const addGoal = (goalInput: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
    const newGoal: Goal = {
      ...goalInput,
      id: 'g-' + Date.now(),
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({ ...prev, goals: [newGoal, ...prev.goals] }));
    addToast('New Goal initialized! 🎯');
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    addToast('Goal updated');
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
    addToast('Goal deleted', 'info');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const allCompleted =
          updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
        if (allCompleted && !g.completed) {
          triggerConfetti();
        }
        return {
          ...g,
          milestones: updatedMilestones,
          completed: allCompleted ? true : g.completed,
          completedAt: allCompleted ? new Date().toISOString().split('T')[0] : g.completedAt,
        };
      }),
    }));
  };

  const toggleGoalCompleted = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id !== id) return g;
        const next = !g.completed;
        if (next) triggerConfetti();
        return {
          ...g,
          completed: next,
          completedAt: next ? new Date().toISOString().split('T')[0] : undefined,
          milestones: next ? g.milestones.map((m) => ({ ...m, completed: true })) : g.milestones,
        };
      }),
    }));
  };

  // --- Calendar Operations ---
  const addEvent = (eventInput: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...eventInput, id: 'ev-' + Date.now() };
    setData((prev) => ({ ...prev, events: [...prev.events, newEvent] }));
    addToast('Calendar event created');
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    addToast('Event updated');
  };

  const deleteEvent = (id: string) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
    addToast('Event deleted', 'info');
  };

  // --- Notes & Journal Operations ---
  const addNote = (noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newNote: Note = {
      ...noteInput,
      id: 'n-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
    addToast('Note created');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : n
      ),
    }));
    addToast('Note saved');
  };

  const deleteNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    addToast('Note deleted', 'info');
  };

  const togglePinNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));
  };

  const saveJournalEntry = (entryInput: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const today = entryInput.date || new Date().toISOString().split('T')[0];
    setData((prev) => {
      const existingIdx = prev.journals.findIndex((j) => j.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev.journals];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...entryInput,
        };
        return { ...prev, journals: updated };
      } else {
        const newEntry: JournalEntry = {
          ...entryInput,
          id: 'j-' + Date.now(),
          date: today,
          createdAt: today,
        };
        return { ...prev, journals: [newEntry, ...prev.journals] };
      }
    });
    addToast('Daily journal saved! ✨');
  };

  const deleteJournalEntry = (id: string) => {
    setData((prev) => ({
      ...prev,
      journals: prev.journals.filter((j) => j.id !== id),
    }));
    addToast('Journal entry deleted', 'info');
  };

  // --- Settings Operations ---
  const updateSettings = (updates: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    addToast('Settings updated');
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        profile: { ...prev.settings.profile, ...profileUpdates },
      },
    }));
    addToast('Profile updated');
  };

  const setTheme = (theme: 'dark' | 'light') => {
    updateSettings({ theme });
  };

  const toggleWidgetVisibility = (id: string) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        dashboardWidgets: prev.settings.dashboardWidgets.map((w) =>
          w.id === id ? { ...w, visible: !w.visible } : w
        ),
      },
    }));
  };

  const updateWidgetOrder = (widgets: DashboardWidgetConfig[]) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        dashboardWidgets: widgets,
      },
    }));
    addToast('Dashboard layout saved');
  };

  const exportBackup = () => {
    exportDataAsJSON(data);
    addToast('Backup downloaded successfully! 💾');
  };

  const importBackup = async (file: File): Promise<boolean> => {
    try {
      const imported = await importDataFromJSON(file);
      setData(imported);
      addToast('Backup restored successfully!', 'success');
      return true;
    } catch (err: any) {
      addToast(err.message || 'Failed to import backup.', 'error');
      return false;
    }
  };

  const resetDemo = () => {
    const demo = resetToDemoData();
    setData(demo);
    addToast('Reset to demo data completed', 'info');
  };

  const clearAll = () => {
    const empty = clearAllData();
    setData(empty);
    addToast('All local data cleared', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        triggerConfetti,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialType,
        openQuickAdd,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        toggleSubtask,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleChapterStatus,
        incrementRevision,
        addExam,
        updateExam,
        deleteExam,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addTimetableEntry,
        deleteTimetableEntry,
        updateGrades,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        toggleGoalCompleted,
        addEvent,
        updateEvent,
        deleteEvent,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        saveJournalEntry,
        deleteJournalEntry,
        updateSettings,
        updateProfile,
        setTheme,
        toggleWidgetVisibility,
        updateWidgetOrder,
        exportBackup,
        importBackup,
        resetDemo,
        clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
