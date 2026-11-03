import React, { useState } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Wallet,
  Flame,
  MoreHorizontal,
  Target,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, data } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'study', label: 'Study', icon: GraduationCap },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'habits', label: 'Habits', icon: Flame },
  ];

  const moreTabs: Array<{ id: NavTab; label: string; icon: any; desc: string }> = [
    { id: 'goals', label: 'Goals & Milestones', icon: Target, desc: 'Short & long-term goals' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, desc: 'Deadlines & study events' },
    { id: 'notes', label: 'Notes & Journal', icon: FileText, desc: 'Rich notes & mood log' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, desc: 'Productivity trends' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'Preferences & backup' },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 px-2 py-1.5 flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            isMoreActive || isMoreOpen
              ? 'text-indigo-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* More Drawer Modal */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-base font-bold text-neutral-100">All Workspaces</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-colors ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-neutral-100'
                        : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{tab.label}</div>
                      <div className="text-xs text-neutral-400">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
