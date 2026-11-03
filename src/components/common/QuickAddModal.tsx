import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckSquare,
  DollarSign,
  Activity,
  Target,
  Calendar,
  FileText,
  Plus,
} from 'lucide-react';
import { Priority, ExpenseCategory, GoalCategory, GoalTerm, HabitCategory } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddInitialType,
    addTask,
    addTransaction,
    addHabit,
    addGoal,
    addEvent,
    addNote,
    data,
  } = useApp();

  type TabType = 'task' | 'transaction' | 'habit' | 'goal' | 'event' | 'note';
  const [activeTab, setActiveTab] = useState<TabType>('task');

  useEffect(() => {
    if (quickAddInitialType) {
      setActiveTab(quickAddInitialType);
    }
  }, [quickAddInitialType, isQuickAddOpen]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskCategory, setTaskCategory] = useState('Study');
  const [taskDueDate, setTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Transaction form state
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState<ExpenseCategory>('Food');
  const [txNote, setTxNote] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Habit form state
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('productivity');
  const [habitColor, setHabitColor] = useState('#6366f1');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('academic');
  const [goalTerm, setGoalTerm] = useState<GoalTerm>('short_term');
  const [goalPriority, setGoalPriority] = useState<Priority>('high');
  const [goalDeadline, setGoalDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Calendar Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<'event' | 'task' | 'exam' | 'reminder'>('event');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      priority: taskPriority,
      status: 'todo',
      category: taskCategory,
      dueDate: taskDueDate,
      subtasks: [],
    });
    setTaskTitle('');
    setTaskDesc('');
    handleClose();
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) return;
    addTransaction({
      type: txType,
      amount: amt,
      category: txCategory,
      note: txNote.trim() || `${txCategory} item`,
      date: txDate,
    });
    setTxAmount('');
    setTxNote('');
    handleClose();
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    addHabit({
      name: habitName.trim(),
      category: habitCategory,
      color: habitColor,
      frequency: 'daily',
      targetPerDay: 1,
    });
    setHabitName('');
    handleClose();
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal({
      title: goalTitle.trim(),
      description: goalDesc.trim() || undefined,
      category: goalCategory,
      term: goalTerm,
      priority: goalPriority,
      deadline: goalDeadline,
      milestones: [
        { id: 'm-' + Date.now(), title: 'Phase 1: Initial milestone', completed: false },
      ],
    });
    setGoalTitle('');
    setGoalDesc('');
    handleClose();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    addEvent({
      title: eventTitle.trim(),
      startDate: eventDate,
      startTime: eventTime,
      category: eventCategory,
      color: '#6366f1',
    });
    setEventTitle('');
    handleClose();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const tags = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    addNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      tags,
      isPinned: false,
    });
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    handleClose();
  };

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'transaction', label: 'Finance', icon: DollarSign },
    { id: 'habit', label: 'Habit', icon: Activity },
    { id: 'goal', label: 'Goal', icon: Target },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'note', label: 'Note', icon: FileText },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Plus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Quick Create</h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950/80 rounded-xl border border-neutral-800 mb-5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        {activeTab === 'task' && (
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to get done?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Description (Optional)</label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Add context, links, details..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800/70 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Projects">Projects</option>
                  <option value="Career">Career</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Add Task
              </button>
            </div>
          </form>
        )}

        {activeTab === 'transaction' && (
          <form onSubmit={handleCreateTx} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`py-2 rounded-xl text-sm font-semibold border ${
                  txType === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`py-2 rounded-xl text-sm font-semibold border ${
                  txType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                Income (+)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Amount ({data.settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Food">Food</option>
                  <option value="Education">Education</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Description / Note</label>
              <input
                type="text"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                placeholder="e.g., Grocery shopping, book purchase"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                Record {txType === 'expense' ? 'Expense' : 'Income'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'habit' && (
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Habit Name *</label>
              <input
                type="text"
                required
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Read 20 pages, Code 1 hour, Morning run"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="productivity">Productivity</option>
                  <option value="study">Study</option>
                  <option value="fitness">Fitness</option>
                  <option value="health">Health</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Theme Color</label>
                <div className="flex items-center gap-2 pt-1">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHabitColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        habitColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Start Habit
              </button>
            </div>
          </form>
        )}

        {activeTab === 'goal' && (
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Goal Title *</label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="What major milestone are you pursuing?"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
              <textarea
                value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
                placeholder="Why is this goal important? Strategy..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Domain</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="academic">Academic</option>
                  <option value="career">Career</option>
                  <option value="financial">Financial</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Timeline</label>
                <select
                  value={goalTerm}
                  onChange={(e) => setGoalTerm(e.target.value as GoalTerm)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="short_term">Short-Term (&lt;3 mo)</option>
                  <option value="long_term">Long-Term (1+ yr)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
              >
                Create Goal
              </button>
            </div>
          </form>
        )}

        {activeTab === 'event' && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Event / Meeting Title *</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Study Group Session, Project Sync"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Type</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="event">Event</option>
                  <option value="task">Task Deadline</option>
                  <option value="exam">Exam</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Add Event
              </button>
            </div>
          </form>
        )}

        {activeTab === 'note' && (
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Note Title *</label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Title or topic..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Content / Markdown</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Jot down formulas, ideas, checklists..."
                rows={4}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100 font-mono text-xs leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="e.g. Study, Algorithms, Cheatsheet"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none text-sm text-neutral-100"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
