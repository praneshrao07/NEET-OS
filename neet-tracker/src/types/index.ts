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

export type TabType = 'dashboard' | 'mock-log' | 'settings';

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
