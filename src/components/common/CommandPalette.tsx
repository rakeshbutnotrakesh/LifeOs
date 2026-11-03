import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  CheckSquare,
  BookOpen,
  DollarSign,
  Activity,
  Target,
  Calendar,
  FileText,
  ArrowRight,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, data, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    const q = query.toLowerCase();
    const matches: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      tab: any;
      icon: any;
    }> = [];

    // Search tasks
    data.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        matches.push({
          id: t.id,
          title: t.title,
          subtitle: `Task • Priority: ${t.priority.toUpperCase()} • Due: ${t.dueDate}`,
          category: 'Tasks',
          tab: 'tasks',
          icon: CheckSquare,
        });
      }
    });

    // Search notes
    data.notes.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q))
      ) {
        matches.push({
          id: n.id,
          title: n.title,
          subtitle: `Note • Tags: ${n.tags.join(', ') || 'None'}`,
          category: 'Notes',
          tab: 'notes',
          icon: FileText,
        });
      }
    });

    // Search goals
    data.goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
        matches.push({
          id: g.id,
          title: g.title,
          subtitle: `Goal • Category: ${g.category} • Deadline: ${g.deadline}`,
          category: 'Goals',
          tab: 'goals',
          icon: Target,
        });
      }
    });

    // Search subjects
    data.subjects.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.instructor?.toLowerCase().includes(q)
      ) {
        matches.push({
          id: s.id,
          title: `${s.name} (${s.code})`,
          subtitle: `Subject • ${s.chapters.length} Chapters • ${s.credits} Credits`,
          category: 'Study',
          tab: 'study',
          icon: BookOpen,
        });
      }
    });

    // Search events & exams
    data.events.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)) {
        matches.push({
          id: e.id,
          title: e.title,
          subtitle: `Calendar Event • ${e.startDate} ${e.startTime || ''}`,
          category: 'Calendar',
          tab: 'calendar',
          icon: Calendar,
        });
      }
    });

    data.exams.forEach((ex) => {
      if (ex.title.toLowerCase().includes(q) || ex.syllabus?.toLowerCase().includes(q)) {
        matches.push({
          id: ex.id,
          title: ex.title,
          subtitle: `Examination • Date: ${ex.date} • ${ex.location || ''}`,
          category: 'Study',
          tab: 'study',
          icon: Calendar,
        });
      }
    });

    // Search transactions
    data.transactions.forEach((tx) => {
      if (tx.note.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q)) {
        matches.push({
          id: tx.id,
          title: `${tx.note || tx.category}`,
          subtitle: `Transaction • ${tx.type === 'income' ? '+' : '-'}${data.settings.currencySymbol}${tx.amount} • ${tx.date}`,
          category: 'Finance',
          tab: 'finance',
          icon: DollarSign,
        });
      }
    });

    return matches.slice(0, 15);
  }, [query, data]);

  const handleSelect = (item: (typeof results)[0]) => {
    setActiveTab(item.tab);
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, notes, goals, subjects, expenses, events..."
            className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 text-base focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs text-neutral-500 bg-neutral-800 rounded border border-neutral-700">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-neutral-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Type to instantly search across all modules in LifeOS</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-400">
                <span className="px-2 py-0.5 bg-neutral-800 rounded">Tasks</span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded">Study</span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded">Finance</span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded">Goals</span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded">Notes</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-500 mt-1">Try searching with a different term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${item.category}-${item.id}-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-neutral-100'
                        : 'hover:bg-neutral-800/60 text-neutral-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-sm text-neutral-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {item.category}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">↵</kbd> to open
            </span>
          </div>
          <span>LifeOS Universal Search</span>
        </div>
      </div>
    </div>
  );
};
