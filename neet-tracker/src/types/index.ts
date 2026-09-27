export interface MockTest {
  id: string;
  mockNumber: number;
  name: string;
  date: string;
  physics: number;     // 0 to 180
  chemistry: number;   // 0 to 180
  biology: number;     // 0 to 360
  total: number;       // physics + chemistry + biology (0 to 720)
  attempted: number;   // 0 to 180 questions
  mistakes: number;    // 0 to attempted questions
  correct: number;     // attempted - mistakes
  unattempted: number; // 180 - attempted
  accuracy: number;    // (correct / attempted) * 100
  errorAnalysisDone: boolean;
  notes?: string;
}

import type { ThemeId } from './theme';

export interface AppSettings {
  targetScore: number;       // default 650
  totalMocksGoal: number;    // default 200
  studentName: string;
  targetCollege: string;
  theme?: ThemeId;
}

export type TabType = 'dashboard' | 'syllabus' | 'mock-log' | 'settings';

export type SubjectType = 'physics' | 'chemistry' | 'biology';

export type ChapterStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ChapterProgress {
  id: string;
  chapterNumber: number;
  name: string;
  subject: SubjectType;
  status: ChapterStatus;
  questionsSolved: number;
  revisionCount: number; // 0 for Rev 0, 1 for R1, 2 for R2, 3 for R3, 4 for R4+
  completedAt?: string; // YYYY-MM-DD
  lastRevisionDate?: string; // YYYY-MM-DD
  nextRevisionDue?: string | null; // YYYY-MM-DD or null
}

export type DueStatusType = 'due-today' | 'overdue' | 'in-future' | 'not-scheduled';

export interface ChapterDueInfo {
  status: DueStatusType;
  label: string;
  diffDays: number;
}

export interface SyllabusSubjectSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  questions: number;
}

export interface SyllabusSummary {
  totalChapters: number;
  completedChapters: number;
  completionPercent: number;
  physics: SyllabusSubjectSummary;
  chemistry: SyllabusSubjectSummary;
  biology: SyllabusSubjectSummary;
  totalQuestionsSolved: number;
  dueTodayCount: number;
  overdueCount: number;
  daysRemaining: number;
  requiredPaceWeekly: number;
}

export interface SubjectStats {
  latest: number;
  max: number;
  average: number;
  percent: number;
}

export interface KPIData {
  completedCount: number;
  totalMocksGoal: number;
  completionPercent: number;
  latestScore: number;
  scoreDelta: number;
  bestScore: number;
  bestScoreDelta: number;
  averageScore: number;
  latestAccuracy: number;
  accuracyDelta: number;
  targetScore: number;
  targetGap: number | 'Target Met';
  errorAnalysisCompletedCount: number;
  errorAnalysisPercent: number;
  subjectStats: {
    physics: SubjectStats;
    chemistry: SubjectStats;
    biology: SubjectStats;
  };
}
