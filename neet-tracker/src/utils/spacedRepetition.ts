import type {
  ChapterProgress,
  ChapterDueInfo,
  SyllabusSummary,
  SyllabusSubjectSummary,
  SubjectType,
} from '../types';

/**
 * Returns today's date in YYYY-MM-DD local format
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a midnight-normalized Date object
 */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Adds N days to a date string (YYYY-MM-DD) or Date object, returning YYYY-MM-DD
 */
export function addDays(baseDate: string | Date, days: number): string {
  const date = typeof baseDate === 'string' ? parseDateString(baseDate) : new Date(baseDate);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Spaced Repetition Intervals per specification:
 * - Initial Study / Rev 0 completion -> R1 in +3 days
 * - R1 completion -> R2 in +7 days
 * - R2 completion -> R3 in +15 days
 * - R3 completion -> R4 in +30 days
 * - R4+ completion -> R5+ in +30 days
 */
export function getRevisionIntervalDays(completedRevisionCount: number): number {
  switch (completedRevisionCount) {
    case 0:
      return 3; // R0 done -> R1 in 3 days
    case 1:
      return 7; // R1 done -> R2 in 7 days
    case 2:
      return 15; // R2 done -> R3 in 15 days
    case 3:
      return 30; // R3 done -> R4 in 30 days
    default:
      return 30; // R4+ -> R5+ in 30 days
  }
}

/**
 * Calculates due status (Due Today, Overdue, In X days, or Not Scheduled)
 */
export function getChapterDueStatus(chapter: ChapterProgress): ChapterDueInfo {
  if (chapter.status !== 'Completed' || !chapter.nextRevisionDue) {
    return {
      status: 'not-scheduled',
      label: '—',
      diffDays: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = parseDateString(chapter.nextRevisionDue);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      label: overdueDays === 1 ? 'Overdue (1 day)' : `Overdue (${overdueDays}d)`,
      diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'due-today',
      label: 'Due Today',
      diffDays: 0,
    };
  }

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return {
    status: 'in-future',
    label: diffDays === 1 ? `In 1 day • ${formattedDate}` : `In ${diffDays} days • ${formattedDate}`,
    diffDays,
  };
}

/**
 * Applies a revision log to a chapter:
 * Updates revisionCount, lastRevisionDate, sets status to Completed,
 * and schedules the next revision due date based on the new milestone.
 */
export function logRevisionForChapter(chapter: ChapterProgress): ChapterProgress {
  const todayStr = getTodayDateString();
  const nextRevisionCount = chapter.status === 'Completed' ? chapter.revisionCount + 1 : 1;
  const interval = getRevisionIntervalDays(nextRevisionCount);
  const nextDue = addDays(todayStr, interval);

  return {
    ...chapter,
    status: 'Completed',
    revisionCount: nextRevisionCount,
    lastRevisionDate: todayStr,
    completedAt: chapter.completedAt || todayStr,
    nextRevisionDue: nextDue,
  };
}

/**
 * Helper to build subject summary
 */
function buildSubjectSummary(chapters: ChapterProgress[], subject: SubjectType): SyllabusSubjectSummary {
  const subjectChapters = chapters.filter((c) => c.subject === subject);
  const completed = subjectChapters.filter((c) => c.status === 'Completed').length;
  const inProgress = subjectChapters.filter((c) => c.status === 'In Progress').length;
  const notStarted = subjectChapters.filter((c) => c.status === 'Not Started').length;
  const questions = subjectChapters.reduce((acc, c) => acc + (c.questionsSolved || 0), 0);

  return {
    total: subjectChapters.length,
    completed,
    inProgress,
    notStarted,
    questions,
  };
}

/**
 * Computes full syllabus KPIs and pace indicator for Target: 31 Dec
 */
export function computeSyllabusSummary(chapters: ChapterProgress[]): SyllabusSummary {
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.status === 'Completed').length;
  const completionPercent = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
  const totalQuestionsSolved = chapters.reduce((acc, c) => acc + (c.questionsSolved || 0), 0);

  let dueTodayCount = 0;
  let overdueCount = 0;

  for (const c of chapters) {
    const dueInfo = getChapterDueStatus(c);
    if (dueInfo.status === 'due-today') {
      dueTodayCount++;
    } else if (dueInfo.status === 'overdue') {
      overdueCount++;
    }
  }

  // Calculate Days Remaining to 31 December
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetYear = today.getFullYear();
  let targetDeadline = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  // If already past Dec 31 of current year, look to next year
  if (today.getTime() > targetDeadline.getTime()) {
    targetDeadline = new Date(targetYear + 1, 11, 31, 23, 59, 59, 999);
  }

  const diffTime = targetDeadline.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.max(0.1, daysRemaining / 7);
  const chaptersRemaining = Math.max(0, totalChapters - completedChapters);

  const requiredPaceWeekly =
    chaptersRemaining === 0 ? 0 : Number((chaptersRemaining / weeksRemaining).toFixed(1));

  return {
    totalChapters,
    completedChapters,
    completionPercent,
    physics: buildSubjectSummary(chapters, 'physics'),
    chemistry: buildSubjectSummary(chapters, 'chemistry'),
    biology: buildSubjectSummary(chapters, 'biology'),
    totalQuestionsSolved,
    dueTodayCount,
    overdueCount,
    daysRemaining,
    requiredPaceWeekly,
  };
}
