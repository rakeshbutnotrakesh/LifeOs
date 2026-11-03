import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCw,
  X,
  Edit2,
  Calculator,
} from 'lucide-react';
import { Subject, Exam, Assignment, TimetableEntry, GradeEntry } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const StudyPage: React.FC = () => {
  const {
    data,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleChapterStatus,
    incrementRevision,
    addExam,
    deleteExam,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addTimetableEntry,
    deleteTimetableEntry,
    updateGrades,
  } = useApp();

  type StudyTab = 'subjects' | 'exams' | 'assignments' | 'timetable' | 'sgpa';
  const [activeSubTab, setActiveSubTab] = useState<StudyTab>('subjects');

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

  // Chapter quick addition
  const [chapterInputSubjectId, setChapterInputSubjectId] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Delete subject confirmation
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  // Form states: Subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#6366f1');
  const [subjectCredits, setSubjectCredits] = useState(4);
  const [subjectInstructor, setSubjectInstructor] = useState('');
  const [subjectTargetGrade, setSubjectTargetGrade] = useState('A+');

  // Form states: Exam
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(data.subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [examTime, setExamTime] = useState('10:00 - 13:00');
  const [examLocation, setExamLocation] = useState('Hall B, Room 204');
  const [examSyllabus, setExamSyllabus] = useState('');

  // Form states: Assignment
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubjectId, setAssignmentSubjectId] = useState(data.subjects[0]?.id || '');
  const [assignmentDueDate, setAssignmentDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(25);

  // Form states: Timetable
  const [ttDay, setTtDay] = useState<TimetableEntry['day']>('Monday');
  const [ttSubjectId, setTtSubjectId] = useState(data.subjects[0]?.id || '');
  const [ttStartTime, setTtStartTime] = useState('09:00');
  const [ttEndTime, setTtEndTime] = useState('10:30');
  const [ttRoom, setTtRoom] = useState('LH-1');

  // Grade scale mapping
  const gradeScale: Record<string, number> = {
    O: 10,
    'A+': 9,
    A: 8,
    'B+': 7,
    B: 6,
    C: 5,
    F: 0,
  };

  // Calculate SGPA
  const { currentSGPA, totalCreditsSum } = useMemo(() => {
    if (data.grades.length === 0) return { currentSGPA: 0, totalCreditsSum: 0 };
    let totalPoints = 0;
    let totalCreds = 0;
    data.grades.forEach((g) => {
      totalPoints += g.credits * g.gradePoint;
      totalCreds += g.credits;
    });
    const sgpa = totalCreds > 0 ? (totalPoints / totalCreds).toFixed(2) : '0.00';
    return { currentSGPA: parseFloat(sgpa), totalCreditsSum: totalCreds };
  }, [data.grades]);

  // Overall syllabus completion
  const totalChaptersCount = data.subjects.reduce((sum, s) => sum + s.chapters.length, 0);
  const completedChaptersCount = data.subjects.reduce(
    (sum, s) => sum + s.chapters.filter((c) => c.status === 'completed').length,
    0
  );
  const overallStudyPct = totalChaptersCount > 0
    ? Math.round((completedChaptersCount / totalChaptersCount) * 100)
    : 0;

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    addSubject({
      name: subjectName.trim(),
      code: subjectCode.trim() || 'SUB-01',
      color: subjectColor,
      credits: Number(subjectCredits) || 3,
      instructor: subjectInstructor.trim() || undefined,
      targetGrade: subjectTargetGrade,
      chapters: [
        {
          id: 'ch-' + Date.now(),
          title: 'Introduction & Foundations',
          status: 'not_started',
          revisionCount: 0,
        },
      ],
    });
    setSubjectName('');
    setSubjectCode('');
    setIsSubjectModalOpen(false);
  };

  const handleAddChapter = (subjectId: string) => {
    if (!newChapterTitle.trim()) return;
    const sub = data.subjects.find((s) => s.id === subjectId);
    if (!sub) return;

    const updatedChapters = [
      ...sub.chapters,
      {
        id: 'ch-' + Date.now(),
        title: newChapterTitle.trim(),
        status: 'not_started' as const,
        revisionCount: 0,
      },
    ];
    updateSubject(subjectId, { chapters: updatedChapters });
    setNewChapterTitle('');
    setChapterInputSubjectId(null);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examSubjectId) return;
    addExam({
      title: examTitle.trim(),
      subjectId: examSubjectId,
      date: examDate,
      time: examTime,
      location: examLocation,
      syllabus: examSyllabus,
    });
    setExamTitle('');
    setIsExamModalOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !assignmentSubjectId) return;
    addAssignment({
      title: assignmentTitle.trim(),
      subjectId: assignmentSubjectId,
      dueDate: assignmentDueDate,
      status: 'pending',
      maxScore: Number(assignmentMaxScore) || 20,
    });
    setAssignmentTitle('');
    setIsAssignmentModalOpen(false);
  };

  const handleCreateTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttSubjectId) return;
    addTimetableEntry({
      day: ttDay,
      subjectId: ttSubjectId,
      startTime: ttStartTime,
      endTime: ttEndTime,
      room: ttRoom,
    });
    setIsTimetableModalOpen(false);
  };

  const handleGradeChange = (subjectId: string, letterGrade: string) => {
    const point = gradeScale[letterGrade] ?? 8;
    const sub = data.subjects.find((s) => s.id === subjectId);
    const credits = sub?.credits || 4;

    const existingIdx = data.grades.findIndex((g) => g.subjectId === subjectId);
    let newGrades = [...data.grades];
    if (existingIdx >= 0) {
      newGrades[existingIdx] = {
        ...newGrades[existingIdx],
        letterGrade,
        gradePoint: point,
      };
    } else {
      newGrades.push({
        id: 'gr-' + Date.now(),
        subjectId,
        credits,
        letterGrade,
        gradePoint: point,
      });
    }
    updateGrades(newGrades);
  };

  const daysUntil = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24)
    );
    if (diff < 0) return 'Passed';
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Academic Summary */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-xs border border-indigo-500/20">
              Student Workspace
            </span>
            <span className="text-xs text-neutral-400">
              {data.subjects.length} Enrolled Courses
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
            Academic Performance &amp; Syllabus Tracker
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Track chapters, prepare for midterms, calculate semester SGPA, and monitor class timetables.
          </p>
        </div>

        {/* Mini SGPA & Syllabus Stat */}
        <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Projected SGPA
            </div>
            <div className="text-2xl font-black text-indigo-400 flex items-center gap-1.5">
              <span>{currentSGPA}</span>
              <span className="text-xs font-semibold text-neutral-500">/ 10.0</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-neutral-800" />
          <div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Syllabus Done
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {overallStudyPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects &amp; Chapters ({data.subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Exam Countdown ({data.exams.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments ({data.assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'timetable'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Class Timetable</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sgpa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'sgpa'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>SGPA Calculator</span>
        </button>
      </div>

      {/* TAB 1: SUBJECTS & CHAPTERS */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-100">Course Syllabus &amp; Progress</h3>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.subjects.map((subject) => {
              const compCount = subject.chapters.filter((c) => c.status === 'completed').length;
              const subProgress =
                subject.chapters.length > 0
                  ? Math.round((compCount / subject.chapters.length) * 100)
                  : 0;

              return (
                <div
                  key={subject.id}
                  className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-neutral-100">{subject.name}</h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                              {subject.code}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5">
                            {subject.credits} Credits • Instructor: {subject.instructor || 'TBD'} • Target: {subject.targetGrade || 'A+'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setDeleteSubjectId(subject.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                        <span>
                          {compCount} of {subject.chapters.length} chapters completed
                        </span>
                        <span className="font-bold text-indigo-400">{subProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${subProgress}%`, backgroundColor: subject.color }}
                        />
                      </div>
                    </div>

                    {/* Chapter List */}
                    <div className="space-y-2 mb-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Chapters / Modules
                      </div>
                      {subject.chapters.map((chap) => {
                        const statusColors = {
                          completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                          in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                          not_started: 'bg-neutral-800 text-neutral-400 border-neutral-700',
                        };

                        return (
                          <div
                            key={chap.id}
                            className="p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => toggleChapterStatus(subject.id, chap.id)}
                                className="shrink-0 text-neutral-400 hover:text-indigo-400"
                              >
                                {chap.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                              <span
                                className={`truncate font-medium ${
                                  chap.status === 'completed'
                                    ? 'line-through text-neutral-400'
                                    : 'text-neutral-200'
                                }`}
                              >
                                {chap.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                onClick={() => toggleChapterStatus(subject.id, chap.id)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer border ${
                                  statusColors[chap.status]
                                }`}
                                title="Click to cycle status"
                              >
                                {chap.status.replace('_', ' ')}
                              </span>

                              <button
                                onClick={() => incrementRevision(subject.id, chap.id)}
                                className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-[10px] flex items-center gap-1"
                                title="Increment revision count"
                              >
                                <RotateCw className="w-2.5 h-2.5" />
                                <span>{chap.revisionCount || 0} rev</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Chapter Form */}
                  <div className="pt-2 border-t border-neutral-800">
                    {chapterInputSubjectId === subject.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChapter(subject.id);
                            }
                          }}
                          placeholder="Chapter title..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddChapter(subject.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setChapterInputSubjectId(null)}
                          className="p-1.5 text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setChapterInputSubjectId(subject.id);
                          setNewChapterTitle('');
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter to Syllabus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS */}
      {activeSubTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-100">Examination Timetable &amp; Syllabus</h3>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.exams.map((exam) => {
              const sub = data.subjects.find((s) => s.id === exam.subjectId);
              const countdown = daysUntil(exam.date);

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-extrabold text-xs border border-rose-500/30">
                        {countdown}
                      </span>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-base text-neutral-100">{exam.title}</h4>
                    <div className="text-xs text-indigo-400 font-medium mt-1">
                      {sub ? `${sub.name} (${sub.code})` : 'General Course'}
                    </div>

                    <div className="space-y-1 text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-800">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{exam.date}</span>
                      </div>
                      {exam.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{exam.time}</span>
                        </div>
                      )}
                      {exam.location && (
                        <div className="text-neutral-400">📍 {exam.location}</div>
                      )}
                    </div>

                    {exam.syllabus && (
                      <div className="mt-3 p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-700/60 text-xs text-neutral-300">
                        <span className="font-semibold text-neutral-400 block mb-1">Syllabus:</span>
                        {exam.syllabus}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-100">Course Assignments &amp; Projects</h3>
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.assignments.map((asgn) => {
              const sub = data.subjects.find((s) => s.id === asgn.subjectId);
              return (
                <div
                  key={asgn.id}
                  className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-4"
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-neutral-100 truncate">
                        {asgn.title}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                        {sub?.name || 'Course'}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
                      <span>Due: {asgn.dueDate}</span>
                      {asgn.maxScore && <span>Max Score: {asgn.maxScore}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={asgn.status}
                      onChange={(e) => updateAssignment(asgn.id, { status: e.target.value as any })}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="graded">Graded</option>
                    </select>

                    <button
                      onClick={() => deleteAssignment(asgn.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TIMETABLE */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-100">Weekly Class Timetable</h3>
            <button
              onClick={() => setIsTimetableModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => {
              const dayClasses = data.timetable
                .filter((t) => t.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={day} className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="font-bold text-xs uppercase tracking-wider text-indigo-400 pb-2 mb-2 border-b border-neutral-800">
                    {day}
                  </div>

                  {dayClasses.length === 0 ? (
                    <div className="text-[11px] text-neutral-500 py-6 text-center">No classes</div>
                  ) : (
                    <div className="space-y-2">
                      {dayClasses.map((cls) => {
                        const sub = data.subjects.find((s) => s.id === cls.subjectId);
                        return (
                          <div
                            key={cls.id}
                            className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-200 truncate">
                                {sub?.code || sub?.name || 'Class'}
                              </span>
                              <button
                                onClick={() => deleteTimetableEntry(cls.id)}
                                className="text-neutral-500 hover:text-rose-400 p-0.5"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-[11px] text-indigo-300 font-mono mt-1">
                              {cls.startTime} - {cls.endTime}
                            </div>
                            {cls.room && (
                              <div className="text-[10px] text-neutral-400 mt-0.5">
                                Room: {cls.room}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SGPA CALCULATOR */}
      {activeSubTab === 'sgpa' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  <span>SGPA &amp; Academic Credit Calculator</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Formula: SGPA = Σ (Course Credits × Grade Points) / Σ Credits
                </p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-baseline gap-2">
                <span className="text-xs text-indigo-300 font-semibold">Semester SGPA:</span>
                <span className="text-2xl font-black text-indigo-400">{currentSGPA}</span>
                <span className="text-xs text-neutral-400">({totalCreditsSum} Total Credits)</span>
              </div>
            </div>

            {/* Courses Table for Grade Input */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="pb-3 px-3">Subject / Course</th>
                    <th className="pb-3 px-3">Credits</th>
                    <th className="pb-3 px-3">Letter Grade</th>
                    <th className="pb-3 px-3">Grade Point</th>
                    <th className="pb-3 px-3">Credit Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {data.subjects.map((sub) => {
                    const gradeRecord = data.grades.find((g) => g.subjectId === sub.id);
                    const letter = gradeRecord?.letterGrade || 'A+';
                    const pt = gradeScale[letter] ?? 9;
                    const creditPts = sub.credits * pt;

                    return (
                      <tr key={sub.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-3 font-semibold text-neutral-200">
                          {sub.name}{' '}
                          <span className="font-mono text-neutral-500 font-normal">
                            ({sub.code})
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-300">{sub.credits}</td>
                        <td className="py-3 px-3">
                          <select
                            value={letter}
                            onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 font-bold focus:outline-none"
                          >
                            <option value="O">O (10)</option>
                            <option value="A+">A+ (9)</option>
                            <option value="A">A (8)</option>
                            <option value="B+">B+ (7)</option>
                            <option value="B">B (6)</option>
                            <option value="C">C (5)</option>
                            <option value="F">F (0)</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-400">{pt}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {creditPts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsSubjectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Add Course / Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS-402"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={subjectCredits}
                    onChange={(e) => setSubjectCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Instructor Name
                </label>
                <input
                  type="text"
                  value={subjectInstructor}
                  onChange={(e) => setSubjectInstructor(e.target.value)}
                  placeholder="e.g. Prof. Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {isExamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsExamModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Schedule Examination</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Test 1"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Subject *
                </label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                >
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="10:00 - 12:00"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Hall / Room
                </label>
                <input
                  type="text"
                  value={examLocation}
                  onChange={(e) => setExamLocation(e.target.value)}
                  placeholder="Hall B, Room 204"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Syllabus Covered
                </label>
                <textarea
                  value={examSyllabus}
                  onChange={(e) => setExamSyllabus(e.target.value)}
                  placeholder="Chapters 1 through 3, theorems..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isAssignmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsAssignmentModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Add Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Lab Report 3"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Subject *
                </label>
                <select
                  value={assignmentSubjectId}
                  onChange={(e) => setAssignmentSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                >
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={assignmentMaxScore}
                    onChange={(e) => setAssignmentMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TIMETABLE MODAL */}
      {isTimetableModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsTimetableModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Add Class to Timetable</h3>
            <form onSubmit={handleCreateTimetable} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Day</label>
                  <select
                    value={ttDay}
                    onChange={(e) => setTtDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Subject</label>
                  <select
                    value={ttSubjectId}
                    onChange={(e) => setTtSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={ttStartTime}
                    onChange={(e) => setTtStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={ttEndTime}
                    onChange={(e) => setTtEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Room / Hall</label>
                <input
                  type="text"
                  value={ttRoom}
                  onChange={(e) => setTtRoom(e.target.value)}
                  placeholder="e.g. LH-3, Lab-B"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTimetableModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation */}
      <ConfirmModal
        isOpen={!!deleteSubjectId}
        title="Delete Subject"
        message="Are you sure you want to delete this course and all associated chapters, exams, and grades?"
        confirmText="Delete Subject"
        onConfirm={() => {
          if (deleteSubjectId) deleteSubject(deleteSubjectId);
        }}
        onCancel={() => setDeleteSubjectId(null)}
      />
    </div>
  );
};
