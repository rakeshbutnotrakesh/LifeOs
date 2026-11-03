import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  BookMarked,
  Pin,
  Plus,
  Trash2,
  Search,
  Tag,
  Smile,
  Meh,
  Frown,
  Zap,
  Award,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Bold,
  Italic,
  List,
  Code,
  CheckSquare,
} from 'lucide-react';
import { Note, JournalEntry, JournalMood } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const NotesJournalPage: React.FC = () => {
  const {
    data,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    saveJournalEntry,
    deleteJournalEntry,
  } = useApp();

  type ActiveTab = 'notes' | 'journal';
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');

  // Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    data.notes[0]?.id || null
  );
  const [notesSearch, setNotesSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Journal form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [journalDate, setJournalDate] = useState(todayStr);

  // Current journal entry for selected date
  const currentJournal = useMemo(() => {
    return data.journals.find((j) => j.date === journalDate);
  }, [data.journals, journalDate]);

  const [journalMood, setJournalMood] = useState<JournalMood>(
    currentJournal?.mood || 'good'
  );
  const [journalEnergy, setJournalEnergy] = useState<number>(
    currentJournal?.energyLevel || 4
  );
  const [journalReflection, setJournalReflection] = useState(
    currentJournal?.reflection || ''
  );
  const [journalAchievements, setJournalAchievements] = useState<string[]>(
    currentJournal?.achievements || ['']
  );
  const [journalImprovements, setJournalImprovements] = useState<string[]>(
    currentJournal?.improvements || ['']
  );

  // When journalDate changes, load existing or blank
  const handleDateChange = (newDate: string) => {
    setJournalDate(newDate);
    const existing = data.journals.find((j) => j.date === newDate);
    if (existing) {
      setJournalMood(existing.mood);
      setJournalEnergy(existing.energyLevel);
      setJournalReflection(existing.reflection);
      setJournalAchievements(existing.achievements.length ? existing.achievements : ['']);
      setJournalImprovements(existing.improvements.length ? existing.improvements : ['']);
    } else {
      setJournalMood('good');
      setJournalEnergy(4);
      setJournalReflection('');
      setJournalAchievements(['']);
      setJournalImprovements(['']);
    }
  };

  // Tags list
  const allTags = useMemo(() => {
    const set = new Set<string>();
    data.notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [data.notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return data.notes
      .filter((n) => {
        if (selectedTag !== 'all' && !n.tags.includes(selectedTag)) return false;
        if (notesSearch.trim()) {
          const q = notesSearch.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes first, then latest
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [data.notes, selectedTag, notesSearch]);

  const selectedNote = data.notes.find((n) => n.id === selectedNoteId);

  const handleCreateNewNote = () => {
    const newNoteId = 'n-' + Date.now();
    addNote({
      title: 'Untitled Note',
      content: '',
      tags: ['General'],
      isPinned: false,
    });
    setSelectedNoteId(newNoteId);
  };

  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    if (!selectedNote) return;
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNote.content;
    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    updateNote(selectedNote.id, { content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry({
      date: journalDate,
      mood: journalMood,
      energyLevel: journalEnergy,
      reflection: journalReflection,
      achievements: journalAchievements.filter((a) => a.trim().length > 0),
      improvements: journalImprovements.filter((i) => i.trim().length > 0),
    });
  };

  const addAchievementField = () => {
    setJournalAchievements((prev) => [...prev, '']);
  };

  const updateAchievementField = (index: number, val: string) => {
    setJournalAchievements((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const removeAchievementField = (index: number) => {
    setJournalAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const addImprovementField = () => {
    setJournalImprovements((prev) => [...prev, '']);
  };

  const updateImprovementField = (index: number, val: string) => {
    setJournalImprovements((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const removeImprovementField = (index: number) => {
    setJournalImprovements((prev) => prev.filter((_, i) => i !== index));
  };

  const moodIcons: Record<JournalMood, { label: string; icon: any; color: string }> = {
    great: { label: 'Great', icon: Smile, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    good: { label: 'Good', icon: Smile, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    neutral: { label: 'Neutral', icon: Meh, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    low: { label: 'Low Energy', icon: Frown, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    stressed: { label: 'Stressed', icon: Frown, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Notes &amp; Daily Journal</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Rich markdown workspace, study formula cheat sheets, and daily mood reflections
          </p>
        </div>

        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes Workspace ({data.notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'journal'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Daily Journal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NOTES WORKSPACE */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
          {/* Notes Sidebar List (1 col) */}
          <div className="p-4 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between space-y-3">
            <div>
              {/* Header and Add Note */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                <span className="font-bold text-sm text-neutral-200">All Notes</span>
                <button
                  onClick={handleCreateNewNote}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    selectedTag === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId;

                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/70 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs truncate flex-1">
                          {note.title || 'Untitled Note'}
                        </span>
                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                        {note.content || 'Empty note...'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                        <span>{note.updatedAt}</span>
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map((t) => (
                            <span key={t} className="bg-neutral-800 px-1.5 py-0.2 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Note Editor Area (2 cols) */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between">
            {selectedNote ? (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Note Editor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 gap-3">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                    placeholder="Note title..."
                    className="text-lg font-extrabold bg-transparent text-neutral-100 focus:outline-none flex-1"
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePinNote(selectedNote.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        selectedNote.isPinned
                          ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                      title={selectedNote.isPinned ? 'Unpin Note' : 'Pin Note to Top'}
                    >
                      <Pin
                        className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-indigo-400' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => setDeleteNoteId(selectedNote.id)}
                      className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Markdown Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-neutral-800/60 rounded-xl border border-neutral-700/60 w-fit">
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('**', '**')}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('*', '*')}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('### ')}
                    className="px-2 py-1 rounded hover:bg-neutral-700 text-xs font-bold text-neutral-300"
                    title="Heading"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('- ')}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('- [ ] ')}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300"
                    title="Checklist"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown('`', '`')}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-300"
                    title="Inline Code"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Textarea */}
                <textarea
                  id="note-textarea"
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  placeholder="Start typing your notes, study formulas, or checklists in markdown..."
                  rows={14}
                  className="w-full flex-1 p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800 text-sm text-neutral-200 font-mono leading-relaxed focus:border-indigo-500 focus:outline-none resize-none"
                />

                {/* Tags editor */}
                <div className="flex items-center gap-2 pt-2">
                  <Tag className="w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={selectedNote.tags.join(', ')}
                    onChange={(e) =>
                      updateNote(selectedNote.id, {
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Tags (comma-separated, e.g. Algorithms, Exam, Formulas)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-500">Autosaved locally</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-neutral-500 p-8">
                <div>
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
                  <p className="text-sm font-semibold">No note selected</p>
                  <p className="text-xs text-neutral-500 mt-1">Select a note or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY JOURNAL WORKSPACE */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Journal Form (2 cols) */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div>
                <h3 className="font-bold text-lg text-neutral-100">Daily Reflection &amp; Mindset</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Record daily gratitude, achievements, and opportunities for growth
                </p>
              </div>

              <input
                type="date"
                value={journalDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none font-bold"
              />
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-6">
              {/* Mood Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  How are you feeling today?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(moodIcons) as JournalMood[]).map((m) => {
                    const item = moodIcons[m];
                    const Icon = item.icon;
                    const isSelected = journalMood === m;

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setJournalMood(m)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? `${item.color} font-bold scale-105 shadow-md`
                            : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Energy Level (1 - 5)</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {journalEnergy} / 5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setJournalEnergy(lvl)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        journalEnergy >= lvl
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection text area */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Daily Reflection &amp; Mental Notes
                </label>
                <textarea
                  value={journalReflection}
                  onChange={(e) => setJournalReflection(e.target.value)}
                  placeholder="What was the highlight of your day? What went well? How did you spend your focus hours?"
                  rows={4}
                  className="w-full p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700 text-sm text-neutral-200 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Top 3 Achievements */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Achievements &amp; Wins</span>
                  </label>
                  <button
                    type="button"
                    onClick={addAchievementField}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {journalAchievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={ach}
                        onChange={(e) => updateAchievementField(idx, e.target.value)}
                        placeholder="e.g. Solved hard dynamic programming problem..."
                        className="flex-1 px-3 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                      />
                      {journalAchievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievementField(idx)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Things to Improve */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-400">Things to Improve</label>
                  <button
                    type="button"
                    onClick={addImprovementField}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {journalImprovements.map((imp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={imp}
                        onChange={(e) => updateImprovementField(idx, e.target.value)}
                        placeholder="e.g. Go to bed 30 minutes earlier..."
                        className="flex-1 px-3 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                      />
                      {journalImprovements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImprovementField(idx)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-neutral-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Reflection for {journalDate}
                </button>
              </div>
            </form>
          </div>

          {/* Past Journal Entries Timeline (1 col) */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
            <h4 className="font-bold text-sm text-neutral-200">Past Journal Reflections</h4>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {data.journals.length === 0 ? (
                <div className="text-xs text-neutral-500 text-center py-8">
                  No journals logged yet
                </div>
              ) : (
                data.journals.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => handleDateChange(j.date)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      j.date === journalDate
                        ? 'bg-indigo-600/20 border-indigo-500/50'
                        : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-neutral-200">{j.date}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-indigo-300">
                        {j.mood} • {j.energyLevel}★
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{j.reflection}</p>
                    {j.achievements.length > 0 && (
                      <div className="text-[11px] text-emerald-400/80 mt-1">
                        🏆 {j.achievements.length} achievements logged
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation */}
      <ConfirmModal
        isOpen={!!deleteNoteId}
        title="Delete Note"
        message="Are you sure you want to delete this note? This operation cannot be reversed."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteNoteId) {
            deleteNote(deleteNoteId);
            if (selectedNoteId === deleteNoteId) {
              setSelectedNoteId(null);
            }
          }
        }}
        onCancel={() => setDeleteNoteId(null)}
      />
    </div>
  );
};
