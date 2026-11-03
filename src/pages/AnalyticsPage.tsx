import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Flame,
  GraduationCap,
  Wallet,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { data } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Task metrics
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Habit metrics
  const totalHabits = data.habits.length;
  const completedTodayHabits = data.habits.filter((h) => !!h.history[todayStr]).length;
  const habitConsistencyScore =
    totalHabits > 0 ? Math.round((completedTodayHabits / totalHabits) * 100) : 0;

  // 3. Study syllabus completion
  const totalChapters = data.subjects.reduce((sum, s) => sum + s.chapters.length, 0);
  const completedChapters = data.subjects.reduce(
    (sum, s) => sum + s.chapters.filter((c) => c.status === 'completed').length,
    0
  );
  const studyCoverageRate =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // 4. Goals metric
  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter((g) => g.completed).length;
  const goalRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // 5. Finance savings rate
  const totalIncome = data.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  // 6. Overall LifeOS Composite Productivity Score (0-100)
  // Weighted: 35% Tasks + 25% Habits + 25% Study + 15% Goals
  const compositeScore = Math.min(
    100,
    Math.round(
      taskCompletionRate * 0.35 +
        habitConsistencyScore * 0.25 +
        studyCoverageRate * 0.25 +
        (goalRate > 0 ? goalRate : 60) * 0.15
    )
  );

  // 14-day trend data
  const trendData = useMemo(() => {
    const list: Array<{ day: string; tasksDone: number; habitsDone: number }> = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Count tasks completed on this day (or due on this day and marked completed)
      const tasksDone = data.tasks.filter(
        (t) => (t.completedAt === str || t.dueDate === str) && t.status === 'completed'
      ).length;

      // Count habits checked on this day
      const habitsDone = data.habits.filter((h) => !!h.history[str]).length;

      list.push({ day: dayLabel, tasksDone, habitsDone });
    }
    return list;
  }, [data.tasks, data.habits]);

  // Tasks by priority chart data
  const priorityChartData = useMemo(() => {
    const map = { urgent: 0, high: 0, medium: 0, low: 0 };
    data.tasks.forEach((t) => {
      map[t.priority] = (map[t.priority] || 0) + 1;
    });
    return [
      { name: 'Urgent', count: map.urgent, fill: '#ef4444' },
      { name: 'High', count: map.high, fill: '#f59e0b' },
      { name: 'Medium', count: map.medium, fill: '#6366f1' },
      { name: 'Low', count: map.low, fill: '#64748b' },
    ];
  }, [data.tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Productivity Score */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empirical Analytics Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Productivity &amp; Velocity Analytics
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
            Calculated 100% locally from your tasks completed, habit adherence history, academic syllabus progression, and cashflow.
          </p>
        </div>

        {/* Big Score Card */}
        <div className="flex items-center gap-5 p-5 rounded-3xl bg-neutral-950/80 border border-neutral-800 shadow-xl shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#262626"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#6366f1"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={200}
                strokeDashoffset={200 - (200 * compositeScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute font-black text-xl text-white">{compositeScore}</span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Productivity Index
            </div>
            <div className="text-sm font-semibold text-indigo-300 mt-0.5">
              {compositeScore >= 80 ? 'Peak Flow State' : compositeScore >= 60 ? 'Strong Velocity' : 'Building Momentum'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">Based on 4-pillar index</div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Task Efficiency
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{taskCompletionRate}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {completedTasks} of {totalTasks} tasks finished
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Habit Consistency
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{habitConsistencyScore}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {completedTodayHabits} of {totalHabits} logged today
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Syllabus Coverage
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{studyCoverageRate}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {completedChapters} of {totalChapters} chapters done
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Savings Surplus
            </span>
            <Wallet className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-400">{savingsRate}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">Inflow vs expense margin</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Activity Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-neutral-100">14-Day Activity Velocity</h3>
              <p className="text-xs text-neutral-400">Daily tasks executed &amp; habits maintained</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaTask" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaHabit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="tasksDone"
                  name="Tasks Done"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaTask)"
                />
                <Area
                  type="monotone"
                  dataKey="habitsDone"
                  name="Habits Checked"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaHabit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Bar Chart (1 col) */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="mb-4">
            <h3 className="font-bold text-base text-neutral-100">Tasks by Priority</h3>
            <p className="text-xs text-neutral-400">Queue allocation</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
