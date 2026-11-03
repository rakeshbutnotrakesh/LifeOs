import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit3,
  Calendar as CalendarIcon,
  Kanban,
  List as ListIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const TasksPage: React.FC = () => {
  const { data, addTask, updateTask, deleteTask, toggleTaskCompleted, toggleSubtask } = useApp();

  type ViewMode = 'list' | 'kanban' | 'calendar';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal state for create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete confirmation
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Expanded subtasks in list view
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('todo');
  const [formCategory, setFormCategory] = useState('Study');
  const [formDueDate, setFormDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueTime, setFormDueTime] = useState('');
  const [formSubtasks, setFormSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>(['Study', 'Personal', 'Projects', 'Career', 'Health']);
    data.tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [data.tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return data.tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [data.tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormStatus('todo');
    setFormCategory('Study');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormDueTime('');
    setFormSubtasks([]);
    setNewSubtaskInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '');
    setFormSubtasks([...task.subtasks]);
    setNewSubtaskInput('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime || undefined,
        subtasks: formSubtasks,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        priority: formPriority,
        status: formStatus,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime || undefined,
        subtasks: formSubtasks,
      });
    }

    setIsModalOpen(false);
  };

  const addSubtaskToForm = () => {
    if (!newSubtaskInput.trim()) return;
    setFormSubtasks((prev) => [
      ...prev,
      { id: 'st-' + Date.now(), title: newSubtaskInput.trim(), completed: false },
    ]);
    setNewSubtaskInput('');
  };

  const removeSubtaskFromForm = (id: string) => {
    setFormSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const toggleSubtaskInForm = (id: string) => {
    setFormSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const toggleSubtaskDropdown = (taskId: string) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const priorityBadges = {
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    low: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  };

  // Kanban Columns
  const kanbanColumns: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'todo', label: 'To Do', color: 'border-neutral-700' },
    { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500/50' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500/50' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar: Title & View Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Tasks &amp; Action Items</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your daily tasks, priority queues, and subtasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, category, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700/60 focus:border-indigo-500 focus:outline-none text-xs text-neutral-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="text-sm font-medium">No tasks found matching your filter criteria</p>
              <button
                onClick={openCreateModal}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Create a task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isExpanded = !!expandedSubtasks[task.id];
              const completedSubtasksCount = task.subtasks.filter((st) => st.completed).length;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-neutral-950/40 border-neutral-800/50 opacity-60'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                      {/* Completion check button */}
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-indigo-400 transition-colors shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              priorityBadges[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                            {task.category}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-neutral-500 mt-2.5">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                            {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                          </span>

                          {task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleSubtaskDropdown(task.id)}
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              <span>
                                {completedSubtasksCount}/{task.subtasks.length} Subtasks
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit, Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTaskId(task.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks dropdown list */}
                  {isExpanded && task.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5 pl-8">
                      {task.subtasks.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => toggleSubtask(task.id, st.id)}
                          className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-800/40 text-xs transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              st.completed
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-neutral-700 bg-neutral-900'
                            }`}
                          >
                            {st.completed && <Check className="w-3 h-3" />}
                          </div>
                          <span
                            className={
                              st.completed
                                ? 'line-through text-neutral-500'
                                : 'text-neutral-300 font-medium'
                            }
                          >
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-4 flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-200">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-xs font-semibold">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      openCreateModal();
                      setFormStatus(col.id);
                    }}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                    title="Add to column"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                      Empty column
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-700/60 hover:border-neutral-600 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              priorityBadges[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                        </div>

                        <div className="font-semibold text-sm text-neutral-200 mb-1">
                          {task.title}
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}

                        {task.subtasks.length > 0 && (
                          <div className="text-[11px] text-neutral-400 mb-2">
                            Subtasks: {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40 text-xs text-neutral-400">
                          <span>{task.dueDate}</span>
                          <div className="flex items-center gap-1">
                            {/* Column status shifter buttons */}
                            {col.id !== 'todo' && (
                              <button
                                onClick={() =>
                                  updateTask(task.id, {
                                    status: col.id === 'completed' ? 'in_progress' : 'todo',
                                  })
                                }
                                className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-700 text-neutral-300 hover:text-white"
                                title="Move Left"
                              >
                                ←
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                onClick={() =>
                                  updateTask(task.id, {
                                    status: col.id === 'todo' ? 'in_progress' : 'completed',
                                  })
                                }
                                className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-700 text-neutral-300 hover:text-white"
                                title="Move Right"
                              >
                                →
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 rounded text-neutral-400 hover:text-white"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="mb-4">
            <h3 className="font-bold text-base text-neutral-100">Tasks by Due Date</h3>
            <p className="text-xs text-neutral-400">Monthly chronological agenda view</p>
          </div>
          <div className="space-y-4">
            {/* Group tasks by date */}
            {Object.entries(
              filteredTasks.reduce((acc, t) => {
                acc[t.dueDate] = acc[t.dueDate] || [];
                acc[t.dueDate].push(t);
                return acc;
              }, {} as Record<string, Task[]>)
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateStr, dateTasks]) => (
                <div key={dateStr} className="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-sm text-neutral-200">{dateStr}</span>
                    <span className="text-xs text-neutral-500">
                      ({dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {dateTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openEditModal(t)}
                        className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 hover:bg-neutral-800 cursor-pointer flex items-center justify-between"
                      >
                        <div className="truncate">
                          <div className="font-medium text-xs text-neutral-100 truncate">
                            {t.title}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            {t.category} • {t.priority}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-5">
              <h3 className="text-lg font-bold">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Add details, notes or instructions..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Study, Career"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  Subtasks Checklist
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtaskToForm();
                      }
                    }}
                    placeholder="Add step or subtask..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSubtaskToForm}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {formSubtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/40 border border-neutral-800 text-xs"
                    >
                      <div
                        onClick={() => toggleSubtaskInForm(st.id)}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            st.completed
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-neutral-600'
                          }`}
                        >
                          {st.completed && <Check className="w-3 h-3" />}
                        </div>
                        <span className={st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}>
                          {st.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubtaskFromForm(st.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={!!deleteTaskId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteTaskId) deleteTask(deleteTaskId);
        }}
        onCancel={() => setDeleteTaskId(null)}
      />
    </div>
  );
};
