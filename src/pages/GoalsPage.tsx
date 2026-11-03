import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  X,
} from 'lucide-react';
import { Goal, GoalCategory, GoalTerm, Priority, Milestone } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const GoalsPage: React.FC = () => {
  const { data, addGoal, updateGoal, deleteGoal, toggleMilestone, toggleGoalCompleted } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'short_term' | 'long_term'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<GoalCategory>('academic');
  const [formTerm, setFormTerm] = useState<GoalTerm>('short_term');
  const [formPriority, setFormPriority] = useState<Priority>('high');
  const [formDeadline, setFormDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [formNotes, setFormNotes] = useState('');
  const [formMilestones, setFormMilestones] = useState<Milestone[]>([]);
  const [newMilestoneInput, setNewMilestoneInput] = useState('');

  const filteredGoals = data.goals.filter((g) => {
    if (activeTab !== 'all' && g.term !== activeTab) return false;
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('academic');
    setFormTerm('short_term');
    setFormPriority('high');
    setFormDeadline(new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setFormNotes('');
    setFormMilestones([
      { id: 'm-' + Date.now(), title: 'Phase 1: Initial research & roadmap', completed: false },
    ]);
    setNewMilestoneInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDesc(goal.description || '');
    setFormCategory(goal.category);
    setFormTerm(goal.term);
    setFormPriority(goal.priority);
    setFormDeadline(goal.deadline);
    setFormNotes(goal.notes || '');
    setFormMilestones([...goal.milestones]);
    setNewMilestoneInput('');
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        category: formCategory,
        term: formTerm,
        priority: formPriority,
        deadline: formDeadline,
        notes: formNotes.trim() || undefined,
        milestones: formMilestones,
      });
    } else {
      addGoal({
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        category: formCategory,
        term: formTerm,
        priority: formPriority,
        deadline: formDeadline,
        notes: formNotes.trim() || undefined,
        milestones: formMilestones,
      });
    }
    setIsModalOpen(false);
  };

  const addMilestone = () => {
    if (!newMilestoneInput.trim()) return;
    setFormMilestones((prev) => [
      ...prev,
      { id: 'm-' + Date.now(), title: newMilestoneInput.trim(), completed: false },
    ]);
    setNewMilestoneInput('');
  };

  const removeMilestone = (id: string) => {
    setFormMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const priorityColors = {
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    low: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  };

  const totalGoalsCount = data.goals.length;
  const completedGoalsCount = data.goals.filter((g) => g.completed).length;
  const goalsPct =
    totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 font-semibold text-xs border border-violet-500/20 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Goal Architecture</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
            Goals, Milestones &amp; Projects
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Align daily actions with long-term ambition. Break down major aspirations into tangible milestones.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-black text-violet-400">
              {completedGoalsCount}/{totalGoalsCount}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-neutral-800" />
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Success Rate
            </div>
            <div className="text-2xl font-black text-emerald-400">{goalsPct}%</div>
          </div>
          <button
            onClick={openCreateModal}
            className="ml-2 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Term Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => setActiveTab('short_term')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'short_term'
                ? 'bg-violet-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Short-Term (&lt;3 Mo)
          </button>
          <button
            onClick={() => setActiveTab('long_term')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'long_term'
                ? 'bg-violet-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Long-Term (1+ Yr)
          </button>
        </div>

        {/* Domain Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="all">All Domains</option>
          <option value="academic">Academic</option>
          <option value="career">Career</option>
          <option value="financial">Financial</option>
          <option value="personal">Personal</option>
          <option value="health">Health</option>
        </select>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((goal) => {
          const totalM = goal.milestones.length;
          const completedM = goal.milestones.filter((m) => m.completed).length;
          const pct = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
          const isDone = goal.completed;

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-70'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          priorityColors[goal.priority]
                        }`}
                      >
                        {goal.priority}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {goal.category}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-500">
                        {goal.term.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-neutral-100 mt-2">{goal.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteGoalId(goal.id)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                    <span>
                      {completedM}/{totalM} Milestones
                    </span>
                    <span className="font-bold text-violet-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Timeline / Checklist */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Milestone Path
                  </div>
                  {goal.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(goal.id, m.id)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-800/40 hover:bg-neutral-800/70 border border-neutral-700/60 cursor-pointer text-xs transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          m.completed
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {m.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`flex-1 font-medium ${
                          m.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>

                {goal.notes && (
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 mb-4">
                    <span className="font-semibold text-neutral-300 block mb-1">Strategy:</span>
                    {goal.notes}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                  Target: {goal.deadline}
                </span>

                <button
                  onClick={() => toggleGoalCompleted(goal.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-neutral-800 hover:bg-violet-600 hover:text-white border-neutral-700 text-neutral-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Completed' : 'Mark Achieved'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold">{editingGoal ? 'Edit Goal' : 'Define New Goal'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Master Full-Stack Architecture, Run Marathon"
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
                  placeholder="What is the high-level objective and motivation?"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Domain</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="academic">Academic</option>
                    <option value="career">Career</option>
                    <option value="financial">Financial</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Timeline Horizon
                  </label>
                  <select
                    value={formTerm}
                    onChange={(e) => setFormTerm(e.target.value as GoalTerm)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="short_term">Short-Term (&lt;3 mo)</option>
                    <option value="long_term">Long-Term (1+ yr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>

              {/* Milestones addition */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Milestones &amp; Checkpoints
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newMilestoneInput}
                    onChange={(e) => setNewMilestoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMilestone();
                      }
                    }}
                    placeholder="Add measurable milestone..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {formMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/40 border border-neutral-800 text-xs"
                    >
                      <span className="text-neutral-200">{m.title}</span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(m.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Strategy / Tactics Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Key resources, partners, daily habits required..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  {editingGoal ? 'Save Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteGoalId}
        title="Delete Goal"
        message="Are you sure you want to remove this goal and its milestone checklist?"
        confirmText="Delete Goal"
        onConfirm={() => {
          if (deleteGoalId) deleteGoal(deleteGoalId);
        }}
        onCancel={() => setDeleteGoalId(null)}
      />
    </div>
  );
};
