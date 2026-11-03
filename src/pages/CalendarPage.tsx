import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const CalendarPage: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent, updateSettings, addToast } = useApp();

  type ViewType = 'month' | 'week' | 'day';
  const [viewType, setViewType] = useState<ViewType>('month');

  // Currently viewed month/year
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formCategory, setFormCategory] = useState<'event' | 'task' | 'exam' | 'reminder'>('event');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formLocation, setFormLocation] = useState('');

  // Unify events: CalendarEvents + Task deadlines + Exams
  const unifiedItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      date: string;
      time?: string;
      type: 'event' | 'task' | 'exam' | 'reminder';
      color: string;
      location?: string;
      isCustomEvent: boolean;
      originalData?: any;
    }> = [];

    // Custom events
    data.events.forEach((ev) => {
      list.push({
        id: ev.id,
        title: ev.title,
        date: ev.startDate,
        time: ev.startTime,
        type: ev.category,
        color: ev.color || '#6366f1',
        location: ev.location,
        isCustomEvent: true,
        originalData: ev,
      });
    });

    // Task deadlines
    data.tasks.forEach((t) => {
      list.push({
        id: 'task-' + t.id,
        title: `Task: ${t.title}`,
        date: t.dueDate,
        time: t.dueTime,
        type: 'task',
        color: t.priority === 'urgent' ? '#ef4444' : '#6366f1',
        isCustomEvent: false,
        originalData: t,
      });
    });

    // Exams
    data.exams.forEach((ex) => {
      list.push({
        id: 'exam-' + ex.id,
        title: `Exam: ${ex.title}`,
        date: ex.date,
        time: ex.time,
        type: 'exam',
        color: '#f43f5e',
        location: ex.location,
        isCustomEvent: false,
        originalData: ex,
      });
    });

    return list;
  }, [data.events, data.tasks, data.exams]);

  // Calendar month matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Days from prev month for padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const prevD = new Date(year, month - 1, dNum);
      const str = prevD.toISOString().split('T')[0];
      days.push({
        dateNumber: dNum,
        dateStr: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currD = new Date(year, month, d);
      const str = currD.toISOString().split('T')[0];
      days.push({
        dateNumber: d,
        dateStr: str,
        isCurrentMonth: true,
        isToday: str === todayStr,
      });
    }

    // Days from next month to fill grid
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextD = new Date(year, month + 1, d);
      const str = nextD.toISOString().split('T')[0];
      days.push({
        dateNumber: d,
        dateStr: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
      });
    }

    return days;
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openCreateModal = (dateStr?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDesc('');
    setFormDate(dateStr || new Date().toISOString().split('T')[0]);
    setFormTime('10:00');
    setFormEndTime('11:00');
    setFormCategory('event');
    setFormColor('#6366f1');
    setFormLocation('');
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormDesc(ev.description || '');
    setFormDate(ev.startDate);
    setFormTime(ev.startTime || '10:00');
    setFormEndTime(ev.endTime || '11:00');
    setFormCategory(ev.category);
    setFormColor(ev.color || '#6366f1');
    setFormLocation(ev.location || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        startDate: formDate,
        startTime: formTime,
        endDate: formDate,
        endTime: formEndTime,
        category: formCategory,
        color: formColor,
        location: formLocation.trim() || undefined,
      });
    } else {
      addEvent({
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        startDate: formDate,
        startTime: formTime,
        endDate: formDate,
        endTime: formEndTime,
        category: formCategory,
        color: formColor,
        location: formLocation.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      addToast('Notifications not supported by this browser.', 'warning');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true });
      addToast('Browser notifications enabled! 🔔', 'success');
      try {
        new Notification('LifeOS Calendar Active', {
          body: 'You will receive reminders for upcoming deadlines and events.',
        });
      } catch {
        // ignore
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      addToast('Notification permission declined', 'info');
    }
  };

  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Calendar &amp; Unified Schedule</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronized agenda of events, study exams, task deadlines &amp; reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <button
            onClick={requestNotificationPermission}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              data.settings.notificationsEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Browser Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {data.settings.notificationsEnabled ? 'Alerts Enabled' : 'Enable Alerts'}
            </span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewType(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  viewType === v ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Month Navigation Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-base text-neutral-100 min-w-44 text-center">
            {monthYearLabel}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700"
        >
          Today
        </button>
      </div>

      {/* VIEW: MONTH */}
      {viewType === 'month' && (
        <div className="p-4 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 pb-3 border-b border-neutral-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {calendarDays.map((cell) => {
              const dayItems = unifiedItems.filter((item) => item.date === cell.dateStr);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => openCreateModal(cell.dateStr)}
                  className={`min-h-24 sm:min-h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isToday
                      ? 'bg-indigo-950/30 border-indigo-500/40'
                      : cell.isCurrentMonth
                      ? 'bg-neutral-900/40 border-neutral-800/60 hover:border-neutral-700'
                      : 'bg-neutral-950/20 border-neutral-900 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        cell.isToday ? 'bg-indigo-600 text-white' : 'text-neutral-400'
                      }`}
                    >
                      {cell.dateNumber}
                    </span>

                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Items pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.isCustomEvent) {
                            openEditModal(item.originalData);
                          }
                        }}
                        className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded border leading-tight transition-transform hover:scale-[1.02]"
                        style={{
                          backgroundColor: `${item.color}20`,
                          color: item.color,
                          borderColor: `${item.color}40`,
                        }}
                        title={`${item.title} ${item.time ? `(${item.time})` : ''}`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-[10px] text-neutral-500 text-center font-bold">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK OR DAY AGENDA */}
      {(viewType === 'week' || viewType === 'day') && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
          <h3 className="font-bold text-base text-neutral-100">Chronological Schedule Agenda</h3>

          <div className="space-y-3">
            {unifiedItems
              .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 truncate">
                    <div
                      className="w-3.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <div className="font-bold text-sm text-neutral-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3 text-neutral-500" />
                          {item.date} {item.time ? `at ${item.time}` : ''}
                        </span>
                        {item.location && <span>📍 {item.location}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      {item.type}
                    </span>

                    {item.isCustomEvent && (
                      <>
                        <button
                          onClick={() => openEditModal(item.originalData)}
                          className="p-1 rounded text-neutral-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteEventId(item.originalData.id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
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
              <h3 className="text-lg font-bold">{editingEvent ? 'Edit Event' : 'Schedule Event'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Study Group Sync, Project Presentation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Type</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="event">Event</option>
                    <option value="task">Task Deadline</option>
                    <option value="exam">Exam</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Location</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Library Hall, Zoom link"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
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
                  {editingEvent ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteEventId}
        title="Delete Calendar Event"
        message="Are you sure you want to remove this event from your calendar?"
        confirmText="Delete"
        onConfirm={() => {
          if (deleteEventId) deleteEvent(deleteEventId);
        }}
        onCancel={() => setDeleteEventId(null)}
      />
    </div>
  );
};
