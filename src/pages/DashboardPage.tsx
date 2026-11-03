import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Flame,
  Wallet,
  GraduationCap,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  Plus,
  BookOpen,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    data,
    setActiveTab,
    toggleTaskCompleted,
    toggleHabitDay,
    openQuickAdd,
    toggleWidgetVisibility,
  } = useApp();

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Welcome message based on time of day
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  // Metrics computation
  const todayTasks = data.tasks.filter(
    (t) => t.dueDate === todayStr || t.status === 'in_progress'
  );
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const taskProgress = todayTasks.length > 0
    ? Math.round((completedTodayTasks / todayTasks.length) * 100)
    : 100;

  // Habits today
  const totalHabits = data.habits.length;
  const completedHabitsToday = data.habits.filter((h) => !!h.history[todayStr]).length;
  const habitPercentage = totalHabits > 0
    ? Math.round((completedHabitsToday / totalHabits) * 100)
    : 0;

  // Finance summary
  const totalIncome = data.transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = data.transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;
  const budgetPercentage = data.settings.monthlyBudget > 0
    ? Math.min(100, Math.round((totalExpense / data.settings.monthlyBudget) * 100))
    : 0;

  // Study summary
  const totalChapters = data.subjects.reduce((sum, s) => sum + s.chapters.length, 0);
  const completedChapters = data.subjects.reduce(
    (sum, s) => sum + s.chapters.filter((c) => c.status === 'completed').length,
    0
  );
  const studyProgress = totalChapters > 0
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  // Upcoming exams sorted by date
  const upcomingExams = [...data.exams]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Today's schedule / events
  const todayEvents = data.events.filter((e) => e.startDate === todayStr);

  // Active goals
  const activeGoals = data.goals.filter((g) => !g.completed).slice(0, 3);

  // 7-day productivity trend chart data
  const chartData = [
    { day: 'Mon', tasks: 4, habits: 5 },
    { day: 'Tue', tasks: 6, habits: 6 },
    { day: 'Wed', tasks: 5, habits: 4 },
    { day: 'Thu', tasks: 7, habits: 5 },
    { day: 'Fri', tasks: 8, habits: 6 },
    { day: 'Sat', tasks: 4, habits: 5 },
    { day: 'Sun', tasks: completedTodayTasks || 5, habits: completedHabitsToday || 4 },
  ];

  // Helper for exam countdown
  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const widgetMap = data.settings.dashboardWidgets.reduce(
    (acc, w) => ({ ...acc, [w.id]: w.visible }),
    {} as Record<string, boolean>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-neutral-800/80 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Life Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {data.settings.profile.name}!
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              You have <span className="text-indigo-400 font-semibold">{todayTasks.length - completedTodayTasks} tasks</span> due today and{' '}
              <span className="text-emerald-400 font-semibold">{upcomingExams.length} examinations</span> on your calendar. Stay focused!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openQuickAdd('task')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Quick Item</span>
            </button>
            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors"
              title="Customize Dashboard Widgets"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Widget Customization Drawer */}
        {isCustomizeOpen && (
          <div className="mt-6 pt-6 border-t border-neutral-800/80 animate-in fade-in duration-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Toggle Dashboard Widgets
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.settings.dashboardWidgets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleWidgetVisibility(w.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    w.visible
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-neutral-800/40 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  {w.visible ? '✓ ' : '+ '}
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Widget: Quick Metrics Stats */}
      {widgetMap.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tasks */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="group cursor-pointer p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Daily Tasks
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {completedTodayTasks}/{todayTasks.length}
              </span>
              <span className="text-xs font-medium text-indigo-400">{taskProgress}% done</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          {/* Card 2: Habits */}
          <div
            onClick={() => setActiveTab('habits')}
            className="group cursor-pointer p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Habit Streak
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {completedHabitsToday}/{totalHabits}
              </span>
              <span className="text-xs font-medium text-amber-400">{habitPercentage}% logged</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${habitPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 3: Finances */}
          <div
            onClick={() => setActiveTab('finance')}
            className="group cursor-pointer p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Balance
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {data.settings.currencySymbol}
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-neutral-400">
                {budgetPercentage}% budget
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 4: Study Progress */}
          <div
            onClick={() => setActiveTab('study')}
            className="group cursor-pointer p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Syllabus Done
              </span>
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {completedChapters}/{totalChapters}
              </span>
              <span className="text-xs font-medium text-violet-400">{studyProgress}% revised</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${studyProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left 2 columns, Right 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget: Daily Tasks */}
          {widgetMap.tasks && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-neutral-100">Today&apos;s Focus &amp; Tasks</h3>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View All ({data.tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  No tasks due today. Enjoy your day or add one!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayTasks.slice(0, 5).map((task) => {
                    const isDone = task.status === 'completed';
                    const priorityColors = {
                      urgent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                      high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      medium: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                      low: 'text-neutral-400 bg-neutral-800 border-neutral-700',
                    };

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-neutral-950/40 border-neutral-800/40 opacity-60'
                            : 'bg-neutral-800/40 border-neutral-700/60 hover:bg-neutral-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button
                            onClick={() => toggleTaskCompleted(task.id)}
                            className="text-neutral-400 hover:text-indigo-400 transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div className="truncate">
                            <span
                              className={`text-sm font-medium ${
                                isDone ? 'line-through text-neutral-500' : 'text-neutral-200'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.subtasks.length > 0 && (
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {task.subtasks.filter((st) => st.completed).length}/
                                {task.subtasks.length} subtasks
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span
                            className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.dueTime && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-400">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Widget: Productivity Analytics Preview */}
          {widgetMap.analytics_preview && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-neutral-100">Productivity Velocity</h3>
                </div>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Full Report <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="taskColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="habitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#262626',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      name="Tasks Completed"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#taskColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="habits"
                      name="Habits Checked"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#habitColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Widget: Active Goals */}
          {widgetMap.goals && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-neutral-100">Active Goals &amp; Milestones</h3>
                </div>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Manage Goals <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const completedM = goal.milestones.filter((m) => m.completed).length;
                  const totalM = goal.milestones.length;
                  const pct = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm text-neutral-200">{goal.title}</div>
                        <span className="text-xs font-semibold text-indigo-400">{pct}%</span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3 line-clamp-1">{goal.description}</p>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                        <span>
                          {completedM}/{totalM} Milestones
                        </span>
                        <span>Due {goal.deadline}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Widget: Daily Habits Quick Check */}
          {widgetMap.habits && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-neutral-100">Daily Habit Check-in</h3>
                </div>
                <button
                  onClick={() => setActiveTab('habits')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  Heatmap
                </button>
              </div>

              <div className="space-y-2">
                {data.habits.slice(0, 6).map((habit) => {
                  const isChecked = !!habit.history[todayStr];
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabitDay(habit.id, todayStr)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        isChecked
                          ? 'bg-neutral-800/80 border-neutral-700/80'
                          : 'bg-neutral-800/30 border-neutral-800 hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span
                          className={`text-xs font-medium truncate ${
                            isChecked ? 'text-neutral-200 font-semibold' : 'text-neutral-400'
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-neutral-950 font-bold'
                            : 'border-neutral-700 bg-neutral-900/50'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Widget: Academic & Exam Countdown */}
          {widgetMap.study && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-base text-neutral-100">Exam Countdown</h3>
                </div>
                <button
                  onClick={() => setActiveTab('study')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  Timetable
                </button>
              </div>

              {upcomingExams.length === 0 ? (
                <p className="text-neutral-500 text-xs text-center py-4">No upcoming exams.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.slice(0, 3).map((exam) => {
                    const daysLabel = getDaysUntil(exam.date);
                    const sub = data.subjects.find((s) => s.id === exam.subjectId);
                    return (
                      <div
                        key={exam.id}
                        className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-neutral-200">{exam.title}</div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {sub?.name || 'Academic Course'}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 whitespace-nowrap">
                            {daysLabel}
                          </span>
                        </div>
                        {exam.location && (
                          <div className="text-[11px] text-neutral-500 mt-2">
                            📍 {exam.location} • {exam.time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Widget: Today's Schedule */}
          {widgetMap.schedule && (
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-neutral-100">Today&apos;s Schedule</h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Calendar
                </button>
              </div>

              {todayEvents.length === 0 ? (
                <p className="text-neutral-500 text-xs text-center py-4">
                  No events scheduled for today.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {todayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between"
                    >
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-200 truncate">
                          {ev.title}
                        </div>
                        {ev.location && (
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {ev.location}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono font-medium text-indigo-400 shrink-0 ml-2">
                        {ev.startTime || 'All day'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
