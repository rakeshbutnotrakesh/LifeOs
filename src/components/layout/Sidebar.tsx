import React, { useState } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Wallet,
  Flame,
  Target,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Plus,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, data, openQuickAdd } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute live badges
  const pendingTasksCount = data.tasks.filter((t) => t.status !== 'completed').length;
  const upcomingExamsCount = data.exams.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingHabitsCount = data.habits.filter((h) => !h.history[todayStr]).length;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: any;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'study',
      label: 'Study Manager',
      icon: GraduationCap,
      badge: upcomingExamsCount > 0 ? upcomingExamsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    { id: 'finance', label: 'Personal Finance', icon: Wallet },
    {
      id: 'habits',
      label: 'Habit Tracker',
      icon: Flame,
      badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    { id: 'goals', label: 'Goals & Projects', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notes', label: 'Notes & Journal', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl h-screen sticky top-0 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 font-bold text-lg">
              L
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">LifeOS</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate">Own Your Time</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <button
            onClick={() => openQuickAdd('task')}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 ${
              isCollapsed ? 'p-2.5' : 'py-2.5 px-3'
            }`}
            title="Quick Create (Task, Expense, Habit...)"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>Quick Add</span>}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl transition-all relative ${
                  isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 text-sm font-medium'
                } ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold border border-neutral-700/60'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-neutral-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Privacy badge & Profile */}
      <div className="p-3 border-t border-neutral-800/60 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800/80 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">100% Offline &amp; Private</span>
          </div>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-800/50 transition-colors text-left ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Account Settings"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {data.settings.profile.avatar || 'LO'}
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="text-xs font-semibold text-neutral-200 truncate">
                {data.settings.profile.name}
              </div>
              <div className="text-[11px] text-neutral-500 truncate">
                {data.settings.profile.role}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
