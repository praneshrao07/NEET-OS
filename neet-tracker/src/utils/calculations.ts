import type { MockTest, AppSettings, KPIData } from '../types';

export function calculateMockFields(params: {
  physics: number;
  chemistry: number;
  biology: number;
  attempted: number;
  mistakes: number;
}) {
  const physics = Math.max(0, Math.min(180, Number(params.physics) || 0));
  const chemistry = Math.max(0, Math.min(180, Number(params.chemistry) || 0));
  const biology = Math.max(0, Math.min(360, Number(params.biology) || 0));
  const attempted = Math.max(0, Math.min(180, Number(params.attempted) || 0));
  const mistakes = Math.max(0, Math.min(attempted, Number(params.mistakes) || 0));

  const total = physics + chemistry + biology;
  const correct = Math.max(0, attempted - mistakes);
  const unattempted = Math.max(0, 180 - attempted);
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

  return {
    physics,
    chemistry,
    biology,
    total,
    attempted,
    mistakes,
    correct,
    unattempted,
    accuracy: Number(accuracy.toFixed(1)),
  };
}

export function computeKPIData(mocks: MockTest[], settings: AppSettings): KPIData {
  const completedCount = mocks.length;
  const totalMocksGoal = settings.totalMocksGoal || 200;
  const completionPercent = totalMocksGoal > 0 ? Math.min(100, (completedCount / totalMocksGoal) * 100) : 0;

  if (completedCount === 0) {
    return {
      completedCount: 0,
      totalMocksGoal,
      completionPercent: 0,
      latestScore: 0,
      scoreDelta: 0,
      bestScore: 0,
      bestScoreDelta: -settings.targetScore,
      averageScore: 0,
      latestAccuracy: 0,
      accuracyDelta: 0,
      targetScore: settings.targetScore,
      targetGap: settings.targetScore,
      errorAnalysisCompletedCount: 0,
      errorAnalysisPercent: 0,
      subjectStats: {
        physics: { latest: 0, max: 180, average: 0, percent: 0 },
        chemistry: { latest: 0, max: 180, average: 0, percent: 0 },
        biology: { latest: 0, max: 360, average: 0, percent: 0 },
      },
    };
  }

  // Sort by mockNumber ascending
  const sorted = [...mocks].sort((a, b) => a.mockNumber - b.mockNumber);
  const latestMock = sorted[sorted.length - 1];
  const previousMock = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const latestScore = latestMock.total;
  const scoreDelta = previousMock ? latestScore - previousMock.total : 0;
  const bestScore = Math.max(...sorted.map(m => m.total));
  const bestScoreDelta = bestScore - settings.targetScore;
  const averageScore = Math.round(sorted.reduce((acc, m) => acc + m.total, 0) / sorted.length);

  const latestAccuracy = latestMock.accuracy;
  const accuracyDelta = previousMock ? Number((latestAccuracy - previousMock.accuracy).toFixed(1)) : 0;

  const targetGap: number | 'Target Met' =
    latestScore >= settings.targetScore ? 'Target Met' : settings.targetScore - latestScore;

  const errorAnalysisCompletedCount = sorted.filter(m => m.errorAnalysisDone).length;
  const errorAnalysisPercent = Math.round((errorAnalysisCompletedCount / completedCount) * 100);

  // Subject statistics
  const avgPhysics = Math.round(sorted.reduce((acc, m) => acc + m.physics, 0) / sorted.length);
  const avgChemistry = Math.round(sorted.reduce((acc, m) => acc + m.chemistry, 0) / sorted.length);
  const avgBiology = Math.round(sorted.reduce((acc, m) => acc + m.biology, 0) / sorted.length);

  return {
    completedCount,
    totalMocksGoal,
    completionPercent: Number(completionPercent.toFixed(1)),
    latestScore,
    scoreDelta,
    bestScore,
    bestScoreDelta,
    averageScore,
    latestAccuracy,
    accuracyDelta,
    targetScore: settings.targetScore,
    targetGap,
    errorAnalysisCompletedCount,
    errorAnalysisPercent,
    subjectStats: {
      physics: {
        latest: latestMock.physics,
        max: 180,
        average: avgPhysics,
        percent: Number(((latestMock.physics / 180) * 100).toFixed(1)),
      },
      chemistry: {
        latest: latestMock.chemistry,
        max: 180,
        average: avgChemistry,
        percent: Number(((latestMock.chemistry / 180) * 100).toFixed(1)),
      },
      biology: {
        latest: latestMock.biology,
        max: 360,
        average: avgBiology,
        percent: Number(((latestMock.biology / 360) * 100).toFixed(1)),
      },
    },
  };
}
