import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  Check,
  Calendar as CalendarIcon,
  Activity,
  Award,
  Sparkles,
  BarChart3,
  X,
} from 'lucide-react';
import { Habit, HabitCategory } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const HabitsPage: React.FC = () => {
  const { data, addHabit, updateHabit, deleteHabit, toggleHabitDay, triggerConfetti } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<HabitCategory>('productivity');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');
  const [formTarget, setFormTarget] = useState(1);
  const [formUnit, setFormUnit] = useState('times');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for last 7 days (Monday to Sunday or current week)
  const currentWeekDays = useMemo(() => {
    const list: Array<{ dateStr: string; dayLabel: string; isToday: boolean }> = [];
    const now = new Date();
    // Start 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      list.push({ dateStr: str, dayLabel: label, isToday: str === todayStr });
    }
    return list;
  }, [todayStr]);

  // Last 60 days for GitHub-style heatmap
  const heatmapDays = useMemo(() => {
    const list: Array<{ dateStr: string; formatted: string }> = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      list.push({ dateStr: str, formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    return list;
  }, []);

  // Calculate streaks
  const calculateStreak = (habit: Habit) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check backwards from today
    const checkDate = new Date();
    // If today is checked
    const todayChecked = !!habit.history[checkDate.toISOString().split('T')[0]];
    if (todayChecked) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday was checked
      checkDate.setDate(checkDate.getDate() - 1);
      if (!habit.history[checkDate.toISOString().split('T')[0]]) {
        currentStreak = 0;
      }
    }

    while (habit.history[checkDate.toISOString().split('T')[0]]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Best streak approximation over history keys
    const sortedDates = Object.keys(habit.history)
      .filter((k) => habit.history[k])
      .sort();

    tempStreak = sortedDates.length > 0 ? 1 : 0;
    bestStreak = tempStreak;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return { currentStreak, bestStreak };
  };

  // Completion stats for today
  const completedToday = data.habits.filter((h) => !!h.history[todayStr]).length;
  const habitCompletionRate =
    data.habits.length > 0 ? Math.round((completedToday / data.habits.length) * 100) : 0;

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormName('');
    setFormCategory('productivity');
    setFormColor('#6366f1');
    setFormFrequency('daily');
    setFormTarget(1);
    setFormUnit('times');
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setFormName(habit.name);
    setFormCategory(habit.category);
    setFormColor(habit.color);
    setFormFrequency(habit.frequency);
    setFormTarget(habit.targetPerDay);
    setFormUnit(habit.unit || 'times');
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: formName.trim(),
        category: formCategory,
        color: formColor,
        frequency: formFrequency,
        targetPerDay: Number(formTarget) || 1,
        unit: formUnit.trim() || 'times',
      });
    } else {
      addHabit({
        name: formName.trim(),
        category: formCategory,
        color: formColor,
        frequency: formFrequency,
        targetPerDay: Number(formTarget) || 1,
        unit: formUnit.trim() || 'times',
      });
    }
    setIsModalOpen(false);
  };

  // Heatmap intensity calculation
  const getHeatmapIntensity = (dateStr: string) => {
    if (data.habits.length === 0) return 0;
    const completedCount = data.habits.filter((h) => !!h.history[dateStr]).length;
    const ratio = completedCount / data.habits.length;
    if (ratio === 0) return 0;
    if (ratio <= 0.3) return 1;
    if (ratio <= 0.7) return 2;
    return 3; // high intensity
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and stats */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Habit Consistency</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
            Atomic Daily Habits &amp; Heatmap
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Build unbreakable momentum. Track daily check-ins, current streaks, and consistency heatmap.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Today&apos;s Score
            </div>
            <div className="text-2xl font-black text-amber-400">
              {completedToday}/{data.habits.length}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-neutral-800" />
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Completion Rate
            </div>
            <div className="text-2xl font-black text-emerald-400">{habitCompletionRate}%</div>
          </div>
          <button
            onClick={openCreateModal}
            className="ml-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* 60-Day Habit Heatmap */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-neutral-200">60-Day Consistency Heatmap</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded bg-neutral-800" />
            <span className="w-3 h-3 rounded bg-amber-900/40" />
            <span className="w-3 h-3 rounded bg-amber-600/70" />
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {heatmapDays.map((day) => {
              const intensity = getHeatmapIntensity(day.dateStr);
              const colorClasses = [
                'bg-neutral-800 border-neutral-700/60',
                'bg-amber-900/50 border-amber-800/50 text-amber-200',
                'bg-amber-600/70 border-amber-500 text-neutral-900',
                'bg-amber-400 border-amber-300 text-neutral-950 font-bold',
              ];

              return (
                <div
                  key={day.dateStr}
                  title={`${day.formatted}: ${
                    data.habits.filter((h) => !!h.history[day.dateStr]).length
                  } habits completed`}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border transition-transform hover:scale-125 cursor-pointer ${colorClasses[intensity]}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Habits Matrix & Weekly Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-100">
            Daily Habits &amp; 7-Day Matrix ({data.habits.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                <th className="pb-3 px-3">Habit</th>
                <th className="pb-3 px-3">Streak</th>
                {currentWeekDays.map((d) => (
                  <th key={d.dateStr} className="pb-3 px-2 text-center">
                    <span className={d.isToday ? 'text-amber-400 font-bold' : ''}>
                      {d.dayLabel}
                    </span>
                  </th>
                ))}
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {data.habits.map((habit) => {
                const { currentStreak, bestStreak } = calculateStreak(habit);

                return (
                  <tr key={habit.id} className="hover:bg-neutral-800/30 transition-colors">
                    {/* Habit Info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <div>
                          <div className="font-bold text-neutral-200 text-sm">{habit.name}</div>
                          <div className="text-[11px] text-neutral-500 capitalize">
                            {habit.category} • {habit.frequency}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Streak Badge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/20 text-xs">
                          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {currentStreak}
                        </span>
                        <span className="text-[10px] text-neutral-500">Best: {bestStreak}</span>
                      </div>
                    </td>

                    {/* 7-Day Matrix Checks */}
                    {currentWeekDays.map((d) => {
                      const isChecked = !!habit.history[d.dateStr];
                      return (
                        <td key={d.dateStr} className="py-3 px-2 text-center">
                          <button
                            onClick={() => toggleHabitDay(habit.id, d.dateStr)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-all ${
                              isChecked
                                ? 'bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20 scale-105'
                                : 'border border-neutral-700 bg-neutral-900/40 text-transparent hover:border-neutral-500'
                            }`}
                            title={`Toggle ${habit.name} for ${d.dateStr}`}
                          >
                            ✓
                          </button>
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(habit)}
                          className="p-1 rounded text-neutral-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteHabitId(habit.id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT HABIT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold">{editingHabit ? 'Edit Habit' : 'Create Habit'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Read 20 pages, 30 min coding, Morning run"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
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
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          formColor === c ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  {editingHabit ? 'Save Changes' : 'Start Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Habit Confirmation */}
      <ConfirmModal
        isOpen={!!deleteHabitId}
        title="Delete Habit"
        message="Are you sure you want to delete this habit and all its history?"
        confirmText="Delete"
        onConfirm={() => {
          if (deleteHabitId) deleteHabit(deleteHabitId);
        }}
        onCancel={() => setDeleteHabitId(null)}
      />
    </div>
  );
};
