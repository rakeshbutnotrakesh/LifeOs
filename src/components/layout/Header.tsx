import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    activeTab,
    setIsSearchOpen,
    openQuickAdd,
    data,
    setTheme,
    setActiveTab,
  } = useApp();

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your tasks, habits, and progress' },
    tasks: { title: 'Task Manager', subtitle: 'Organize your workflows, sprints & daily to-dos' },
    study: { title: 'Study Manager', subtitle: 'Academic timetable, exams, assignments & SGPA' },
    finance: { title: 'Personal Finance', subtitle: 'Cash flow, categorized expenses & savings rate' },
    habits: { title: 'Habit Tracker', subtitle: 'Build daily consistency and track long streaks' },
    goals: { title: 'Goals & Milestones', subtitle: 'Long-term vision and tactical short-term targets' },
    calendar: { title: 'Calendar & Schedule', subtitle: 'Unified view of deadlines, exams and events' },
    notes: { title: 'Notes & Journal', subtitle: 'Formulas, project notes and daily mood reflections' },
    analytics: { title: 'Productivity Analytics', subtitle: 'Data-driven insights from your local activity' },
    settings: { title: 'Settings & Storage', subtitle: 'Customize preferences, backup and restore data' },
  };

  const current = titles[activeTab] || { title: 'LifeOS', subtitle: 'Personal Workspace' };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isDark = data.settings.theme === 'dark';

  return (
    <header className="sticky top-0 z-20 w-full bg-neutral-900/60 backdrop-blur-xl border-b border-neutral-800/70 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Current Page Title */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-100 flex items-center gap-2">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-neutral-400 mt-0.5">{current.subtitle}</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today's Date Tag */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium text-neutral-300">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 hover:text-white border border-neutral-700/60 text-xs font-medium transition-colors shadow-sm"
            title="Search anything (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-neutral-900 rounded border border-neutral-700 text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => openQuickAdd('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Mobile Profile Avatar */}
          <button
            onClick={() => setActiveTab('settings')}
            className="md:hidden w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs"
          >
            {data.settings.profile.avatar || 'LO'}
          </button>
        </div>
      </div>
    </header>
  );
};
