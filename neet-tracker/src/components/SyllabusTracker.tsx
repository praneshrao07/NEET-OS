import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCcw,
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
  X,
  Target,
} from 'lucide-react';
import type {
  ChapterProgress,
  ChapterStatus,
  SubjectType,
} from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  computeSyllabusSummary,
  getChapterDueStatus,
  logRevisionForChapter,
  addDays,
  getTodayDateString,
} from '../utils/spacedRepetition';

interface SyllabusTrackerProps {
  syllabus: ChapterProgress[];
  onUpdateChapter: (id: string, updates: Partial<ChapterProgress>) => Promise<void>;
  onLogRevision: (id: string) => Promise<void>;
  onResetSyllabus?: () => Promise<void>;
}

export const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({
  syllabus,
  onUpdateChapter,
  onLogRevision,
}) => {
  const { theme } = useTheme();

  // Active Subject Tab: 'physics' | 'chemistry' | 'biology'
  const [activeSubject, setActiveSubject] = useState<SubjectType>('physics');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'Completed' | 'In Progress' | 'Not Started'>('all');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3800);
  };

  // Compute live syllabus summary & KPIs
  const summary = useMemo(() => computeSyllabusSummary(syllabus), [syllabus]);

  // Overall Circular Progress Ring calculations
  const ringRadius = 36;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (summary.completionPercent / 100) * ringCircumference;

  // Filtered chapters for table
  const subjectChapters = useMemo(() => {
    return syllabus.filter((c) => c.subject === activeSubject);
  }, [syllabus, activeSubject]);

  const filteredChapters = useMemo(() => {
    return subjectChapters.filter((chapter) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = chapter.name.toLowerCase().includes(query);
        const matchesNum = `#${chapter.chapterNumber}`.includes(query) || `${chapter.chapterNumber}` === query;
        if (!matchesName && !matchesNum) return false;
      }

      // Status filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'due') {
        const dueInfo = getChapterDueStatus(chapter);
        return dueInfo.status === 'due-today' || dueInfo.status === 'overdue';
      }
      return chapter.status === statusFilter;
    });
  }, [subjectChapters, searchQuery, statusFilter]);

  // Handle status dropdown change
  const handleStatusChange = async (chapter: ChapterProgress, newStatus: ChapterStatus) => {
    const updates: Partial<ChapterProgress> = { status: newStatus };
    const todayStr = getTodayDateString();

    if (newStatus === 'Completed') {
      if (!chapter.completedAt) {
        updates.completedAt = todayStr;
      }
      // If marking completed and revision schedule not set, schedule R1 for +3 days
      if (!chapter.nextRevisionDue) {
        updates.nextRevisionDue = addDays(todayStr, 3);
        showToast(`${chapter.name}: Marked Completed! R1 scheduled in 3 days.`);
      }
    } else if (newStatus === 'Not Started') {
      updates.revisionCount = 0;
      updates.nextRevisionDue = null;
    }

    await onUpdateChapter(chapter.id, updates);
  };

  // Handle Questions quick add or direct edit
  const handleQuestionsChange = async (chapter: ChapterProgress, newCount: number) => {
    const count = Math.max(0, isNaN(newCount) ? 0 : newCount);
    const updates: Partial<ChapterProgress> = { questionsSolved: count };

    // Automatically shift to "In Progress" if currently "Not Started" and questions > 0
    if (chapter.status === 'Not Started' && count > 0) {
      updates.status = 'In Progress';
    }

    await onUpdateChapter(chapter.id, updates);
  };

  const handleQuickAddQuestions = async (chapter: ChapterProgress, delta: number) => {
    const newCount = (chapter.questionsSolved || 0) + delta;
    await handleQuestionsChange(chapter, newCount);
  };

  // Handle Log Revision
  const handleLogRevisionClick = async (chapter: ChapterProgress) => {
    const updatedChapter = logRevisionForChapter(chapter);
    await onLogRevision(chapter.id);
    const dueInfo = getChapterDueStatus(updatedChapter);
    showToast(
      `✓ Logged R${updatedChapter.revisionCount} for ${chapter.name}! Next recall: ${dueInfo.label}`
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-24 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl animate-bounce-once transition-all duration-300"
          style={{
            backgroundColor: `${theme.bgPanel}F2`,
            borderColor: `rgba(${theme.accentRgb}, 0.5)`,
            boxShadow: `0 8px 30px rgba(${theme.accentRgb}, 0.35)`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: theme.accentPrimary }}
          ></div>
          <span className="text-xs font-semibold text-white tracking-wide">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 ml-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* ============================================================== */}
        {/* 1. COMPACT TOP PACE INDICATOR BANNER (Specification 3.3) */}
        {/* ============================================================== */}
        <div
          className="relative overflow-hidden rounded-xl p-3 px-5 border flex flex-wrap items-center justify-between gap-3 shadow-lg"
          style={{
            background: `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.04) 50%, rgba(${theme.accentRgb}, 0.12) 100%)`,
            borderColor: `rgba(${theme.accentRgb}, 0.35)`,
            boxShadow: `0 0 20px rgba(${theme.accentRgb}, 0.15)`,
          }}
        >
          {/* Subtle glow background */}
          <div
            className="absolute -top-12 -left-12 w-48 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: `rgba(${theme.accentRgb}, 0.15)` }}
          ></div>

          <div className="flex items-center gap-3 relative z-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
              }}
            >
              <Target className="w-4 h-4" style={{ color: theme.accentGlow }} />
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-white">
                Target: 31 Dec
              </span>
              <span className="text-slate-500 font-mono text-xs">|</span>
              <span className="text-xs font-mono font-bold text-white">
                <span style={{ color: theme.accentGlow }}>{summary.daysRemaining}</span> Days Remaining
              </span>
              <span className="text-slate-500 font-mono text-xs">|</span>
              <span className="text-xs font-mono text-slate-300">
                Required Pace:{' '}
                <span className="font-bold text-white" style={{ color: theme.accentPrimary }}>
                  {summary.requiredPaceWeekly} chapters/week
                </span>{' '}
                to finish on time
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `rgba(${theme.accentRgb}, 0.18)`,
                color: theme.accentGlow,
                border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
              }}
            >
              ACTIVE RECALL + SPACED REPETITION
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. TOP SUMMARY BAR FOR SYLLABUS (Specification 6) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Syllabus Progress Ring */}
          <div
            className="p-4 rounded-2xl border relative overflow-hidden flex items-center gap-4 transition-all duration-300"
            style={{
              backgroundColor: theme.bgPanel,
              borderColor: `rgba(${theme.accentRgb}, 0.22)`,
            }}
          >
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  stroke="#141E2F"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  stroke={theme.accentPrimary}
                  strokeWidth="7"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px rgba(${theme.accentRgb}, 0.6))`,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-heading font-extrabold text-white tracking-tight">
                  {Math.round(summary.completionPercent)}%
                </span>
                <span className="text-[9px] text-[#8E9AAA] uppercase font-mono tracking-wider">DONE</span>
              </div>
            </div>

            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E9AAA] block">
                Total Syllabus
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-heading font-extrabold text-xl text-white">
                  {summary.completedChapters}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ {summary.totalChapters} ch</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {summary.totalChapters - summary.completedChapters} chapters to study
              </p>
            </div>
          </div>

          {/* Card 2: Subject Progress Bars */}
          <div
            className="p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300"
            style={{
              backgroundColor: theme.bgPanel,
              borderColor: `rgba(${theme.accentRgb}, 0.22)`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E9AAA]">
                Subject Breakdown
              </span>
              <span className="text-[10px] font-mono text-slate-400">Completion</span>
            </div>

            <div className="space-y-2">
              {/* Physics */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-cyan-400 flex items-center gap-1.5 text-[11px]">
                    <Atom className="w-3 h-3" /> Physics
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">
                    <strong className="text-white">{summary.physics.completed}</strong> / {summary.physics.total} Done
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    style={{
                      width: `${(summary.physics.completed / summary.physics.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Chemistry */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-amber-400 flex items-center gap-1.5 text-[11px]">
                    <FlaskConical className="w-3 h-3" /> Chemistry
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">
                    <strong className="text-white">{summary.chemistry.completed}</strong> / {summary.chemistry.total} Done
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                    style={{
                      width: `${(summary.chemistry.completed / summary.chemistry.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Biology */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-400 flex items-center gap-1.5 text-[11px]">
                    <Dna className="w-3 h-3" /> Biology
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">
                    <strong className="text-white">{summary.biology.completed}</strong> / {summary.biology.total} Done
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                    style={{
                      width: `${(summary.biology.completed / summary.biology.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Total Questions Solved */}
          <div
            className="p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300"
            style={{
              backgroundColor: theme.bgPanel,
              borderColor: `rgba(${theme.accentRgb}, 0.22)`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E9AAA] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
                  Practice Questions
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `rgba(${theme.accentRgb}, 0.15)`,
                    color: theme.accentPrimary,
                  }}
                >
                  ALL 3 SUBJECTS
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
                  {summary.totalQuestionsSolved.toLocaleString()}
                </span>
                <span className="text-xs font-bold" style={{ color: theme.accentGlow }}>
                  Solved
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="text-cyan-300">P: {summary.physics.questions}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300">C: {summary.chemistry.questions}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-300">B: {summary.biology.questions}</span>
            </div>
          </div>

          {/* Card 4: Due for Active Recall (Quick filter toggle) */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'due' ? 'all' : 'due')}
            className={`p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 group ${
              statusFilter === 'due' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: theme.bgPanel,
              borderColor:
                summary.dueTodayCount > 0
                  ? `rgba(${theme.accentRgb}, 0.5)`
                  : `rgba(${theme.accentRgb}, 0.22)`,
              boxShadow:
                summary.dueTodayCount > 0
                  ? `0 0 20px rgba(${theme.accentRgb}, 0.2)`
                  : undefined,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E9AAA] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: theme.accentGlow }} />
                  Due for Active Recall
                </span>
                {statusFilter === 'due' && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: theme.accentPrimary,
                      color: '#05070B',
                    }}
                  >
                    FILTER ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className="font-heading font-extrabold text-2xl tracking-tight transition-transform group-hover:scale-105 inline-block"
                  style={{ color: summary.dueTodayCount > 0 ? theme.accentGlow : '#FFFFFF' }}
                >
                  {summary.dueTodayCount}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: summary.dueTodayCount > 0 ? theme.accentPrimary : '#8E9AAA' }}
                >
                  Due Today
                </span>
                {summary.overdueCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    {summary.overdueCount} Overdue
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {statusFilter === 'due' ? 'Click to show all' : 'Click to filter due only'}
              </span>
              <span
                className="text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                style={{ color: theme.accentPrimary }}
              >
                Filter <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. SUBJECT TABS & CONTROLS */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Subject Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#090E17] border border-[#141E2F] shrink-0">
            <button
              onClick={() => setActiveSubject('physics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer ${
                activeSubject === 'physics'
                  ? 'text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeSubject === 'physics'
                  ? {
                      backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                      color: theme.accentGlow,
                      border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                    }
                  : undefined
              }
            >
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span>Physics</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                {summary.physics.completed}/{summary.physics.total}
              </span>
            </button>

            <button
              onClick={() => setActiveSubject('chemistry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer ${
                activeSubject === 'chemistry'
                  ? 'text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeSubject === 'chemistry'
                  ? {
                      backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                      color: theme.accentGlow,
                      border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                    }
                  : undefined
              }
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Chemistry</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                {summary.chemistry.completed}/{summary.chemistry.total}
              </span>
            </button>

            <button
              onClick={() => setActiveSubject('biology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 cursor-pointer ${
                activeSubject === 'biology'
                  ? 'text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeSubject === 'biology'
                  ? {
                      backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                      color: theme.accentGlow,
                      border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                    }
                  : undefined
              }
            >
              <Dna className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biology</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                {summary.biology.completed}/{summary.biology.total}
              </span>
            </button>
          </div>

          {/* Search Bar & Filter dropdown */}
          <div className="flex items-center gap-3 flex-1 sm:max-w-md ml-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${activeSubject} chapters...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090E17] border border-[#141E2F] focus:border-[#00A8FF]/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                style={{
                  borderColor: searchQuery ? `rgba(${theme.accentRgb}, 0.5)` : undefined,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-[#090E17] border border-[#141E2F] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="due">Due / Overdue</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. CHAPTER TABLE (Specification 5) */}
        {/* ============================================================== */}
        <div
          className="rounded-2xl border overflow-hidden shadow-xl"
          style={{
            backgroundColor: theme.bgPanel,
            borderColor: `rgba(${theme.accentRgb}, 0.2)`,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#141E2F] bg-[#070B12]/80 text-[#8E9AAA] text-[11px] font-semibold uppercase tracking-wider select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Chapter Name</th>
                  <th className="py-3 px-4 w-40">Status</th>
                  <th className="py-3 px-4 w-52">Questions Solved</th>
                  <th className="py-3 px-4 w-28 text-center">Revisions</th>
                  <th className="py-3 px-4 w-48">Next Active Recall Due</th>
                  <th className="py-3 px-4 w-36 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141E2F]/60 text-xs">
                {filteredChapters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-6 h-6 text-slate-600" />
                        <p className="text-sm font-medium text-slate-400">No chapters found</p>
                        <p className="text-xs text-slate-600">
                          Try adjusting your search query or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredChapters.map((chapter) => {
                    const dueInfo = getChapterDueStatus(chapter);
                    const isDueToday = dueInfo.status === 'due-today';
                    const isOverdue = dueInfo.status === 'overdue';

                    return (
                      <tr
                        key={chapter.id}
                        className={`transition-colors duration-150 hover:bg-white/[0.025] ${
                          isDueToday
                            ? 'bg-blue-500/[0.04]'
                            : isOverdue
                            ? 'bg-red-500/[0.04]'
                            : ''
                        }`}
                      >
                        {/* Chapter Number */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-[11px]">
                          {String(chapter.chapterNumber).padStart(2, '0')}
                        </td>

                        {/* Chapter Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-medium text-slate-100 tracking-wide text-sm">
                              {chapter.name}
                            </span>
                            {chapter.status === 'Completed' && (
                              <span title="Completed" className="flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status (Dropdown) */}
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block w-full">
                            <select
                              value={chapter.status}
                              onChange={(e) =>
                                handleStatusChange(chapter, e.target.value as ChapterStatus)
                              }
                              className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-lg font-medium text-xs border transition-all cursor-pointer focus:outline-none ${
                                chapter.status === 'Completed'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : chapter.status === 'In Progress'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                              }`}
                            >
                              <option value="Not Started" className="bg-[#0B1018] text-slate-300">
                                Not Started
                              </option>
                              <option value="In Progress" className="bg-[#0B1018] text-amber-300">
                                In Progress
                              </option>
                              <option value="Completed" className="bg-[#0B1018] text-emerald-300">
                                Completed
                              </option>
                            </select>
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* Questions Solved (+10 / +25 and direct input) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {/* Direct number input */}
                            <input
                              type="number"
                              min="0"
                              value={chapter.questionsSolved || 0}
                              onChange={(e) =>
                                handleQuestionsChange(chapter, parseInt(e.target.value, 10))
                              }
                              className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-[#090E17] border border-slate-700/60 rounded-lg text-white focus:outline-none focus:border-[#00A8FF]/50"
                            />

                            {/* +10 Button */}
                            <button
                              onClick={() => handleQuickAddQuestions(chapter, 10)}
                              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold border transition-all hover:brightness-125 active:scale-95 cursor-pointer"
                              style={{
                                backgroundColor: `rgba(${theme.accentRgb}, 0.12)`,
                                borderColor: `rgba(${theme.accentRgb}, 0.3)`,
                                color: theme.accentGlow,
                              }}
                              title="Add 10 questions"
                            >
                              +10
                            </button>

                            {/* +25 Button */}
                            <button
                              onClick={() => handleQuickAddQuestions(chapter, 25)}
                              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold border transition-all hover:brightness-125 active:scale-95 cursor-pointer"
                              style={{
                                backgroundColor: `rgba(${theme.accentRgb}, 0.18)`,
                                borderColor: `rgba(${theme.accentRgb}, 0.4)`,
                                color: theme.accentPrimary,
                              }}
                              title="Add 25 questions"
                            >
                              +25
                            </button>
                          </div>
                        </td>

                        {/* Revisions Badge (R0, R1, R2, etc.) */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-mono text-xs font-bold tracking-wider ${
                              chapter.revisionCount === 0
                                ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                                : chapter.revisionCount === 1
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                                : chapter.revisionCount === 2
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                                : chapter.revisionCount === 3
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            }`}
                          >
                            R{chapter.revisionCount || 0}
                          </span>
                        </td>

                        {/* Next Active Recall Due */}
                        <td className="py-3.5 px-4">
                          {isDueToday ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide animate-pulse"
                              style={{
                                backgroundColor: `rgba(${theme.accentRgb}, 0.18)`,
                                borderColor: `rgba(${theme.accentRgb}, 0.6)`,
                                color: theme.accentGlow,
                                border: `1px solid rgba(${theme.accentRgb}, 0.5)`,
                                boxShadow: `0 0 14px rgba(${theme.accentRgb}, 0.4)`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: theme.accentGlow }}
                              ></span>
                              {dueInfo.label}
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-red-500/15 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              {dueInfo.label}
                            </span>
                          ) : dueInfo.status === 'in-future' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {dueInfo.label}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Action: "+ Log Revision" */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleLogRevisionClick(chapter)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-200 hover:brightness-115 active:scale-95 cursor-pointer shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accentSecondary}, ${theme.accentPrimary})`,
                              boxShadow: isDueToday
                                ? `0 0 15px rgba(${theme.accentRgb}, 0.5)`
                                : undefined,
                            }}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>+ Log Revision</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="p-3 px-5 border-t border-[#141E2F] bg-[#070B12]/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredChapters.length} of {subjectChapters.length} {activeSubject} chapters
            </span>
            <span className="font-mono text-[11px]">
              Next revision milestone intervals: R1: +3d | R2: +7d | R3: +15d | R4+: +30d
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
