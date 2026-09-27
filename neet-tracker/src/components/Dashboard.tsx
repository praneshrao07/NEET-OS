import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
  Layers,
  Activity
} from 'lucide-react';
import type { MockTest, KPIData, AppSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  mocks: MockTest[];
  kpi: KPIData;
  settings: AppSettings;
  onOpenAddModal: () => void;
  onToggleErrorAnalysis: (mockId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  mocks,
  kpi,
  settings,
  onOpenAddModal,
}) => {
  const { theme } = useTheme();
  const [chartFilter, setChartFilter] = useState<'all' | '10' | '20'>('all');
  const [showSubjectBreakdown, setShowSubjectBreakdown] = useState(false);

  // Prepare chart dataset
  const sortedMocks = [...mocks].sort((a, b) => a.mockNumber - b.mockNumber);
  let displayChartData = sortedMocks;
  if (chartFilter === '10') {
    displayChartData = sortedMocks.slice(-10);
  } else if (chartFilter === '20') {
    displayChartData = sortedMocks.slice(-20);
  }

  const latestMock = sortedMocks.length > 0 ? sortedMocks[sortedMocks.length - 1] : null;

  // Render Delta Badge
  const renderDelta = (delta: number, isPercentage = false, invertGood = false) => {
    if (delta === 0) return <span className="text-[10px] text-slate-500 font-mono">0.0</span>;
    const isPositive = delta > 0;
    const isGood = invertGood ? !isPositive : isPositive;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
          isGood
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        }`}
      >
        <Icon className="w-2.5 h-2.5" />
        {isPositive ? '+' : ''}
        {delta}
        {isPercentage ? '%' : ''}
      </span>
    );
  };

  // Helper for Circular progress in center insights panel
  const renderCircleProgress = (label: string, value: number, target: number, subtext: string, color: string) => {
    const radius = 24;
    const circ = 2 * Math.PI * radius;
    const pct = Math.min(100, Math.round((value / target) * 100));
    const offset = circ - (pct / 100) * circ;

    return (
      <div className="flex flex-col items-center p-3 rounded-xl bg-[#090E17]/80 border border-[#141F32]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r={radius} stroke="#131B2B" strokeWidth="4" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <span className="font-mono font-bold text-xs text-white block leading-tight">{pct}%</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-300 block">{label}</span>
        <span className="text-[10px] font-mono text-[#8E9AAA] mt-0.5">
          {value} / {target}
        </span>
        <span className="text-[9px] text-slate-500 mt-0.5">{subtext}</span>
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar transition-colors duration-250"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* ---------------- 1. TOP 7 KPI CARDS ROW ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: Mocks Completed */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Mocks Done</span>
              <Activity className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading font-extrabold text-2xl text-white">
                {kpi.completedCount}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {kpi.totalMocksGoal}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-1.5 bg-[#141E2F] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${kpi.completionPercent}%`,
                  background: `linear-gradient(to right, ${theme.accentSecondary}, ${theme.accentPrimary})`,
                  boxShadow: `0 0 8px ${theme.accentPrimary}`,
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-[10px] text-[#8E9AAA] font-mono">
              <span>Progress</span>
              <span className="font-semibold" style={{ color: theme.accentPrimary }}>
                {kpi.completionPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Latest Score */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Latest Score</span>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: theme.accentGlow }} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading font-extrabold text-2xl text-white">
                {kpi.latestScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 720</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#8E9AAA]">vs previous</span>
            {renderDelta(kpi.scoreDelta)}
          </div>
        </div>

        {/* KPI 3: Best Score */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Best Score</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading font-extrabold text-2xl text-amber-300">
                {kpi.bestScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 720</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#8E9AAA]">vs target</span>
            {renderDelta(kpi.bestScoreDelta)}
          </div>
        </div>

        {/* KPI 4: Average Score */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Avg Score</span>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: theme.accentGlow }} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading font-extrabold text-2xl text-white">
                {kpi.averageScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 720</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#8E9AAA]">
            <span>Total Mocks</span>
            <span className="font-mono text-slate-300 font-semibold">{kpi.completedCount}</span>
          </div>
        </div>

        {/* KPI 5: Latest Accuracy */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Accuracy</span>
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading font-extrabold text-2xl text-emerald-400">
                {kpi.latestAccuracy.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#8E9AAA]">delta</span>
            {renderDelta(kpi.accuracyDelta, true)}
          </div>
        </div>

        {/* KPI 6: Target Score (Highlighted glowing) */}
        <div
          className="card-panel p-3.5 flex flex-col justify-between relative overflow-hidden transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(${theme.accentRgb}, 0.16) 0%, ${theme.bgPanel} 100%)`,
            borderColor: `rgba(${theme.accentRgb}, 0.45)`,
            boxShadow: `0 0 25px rgba(${theme.accentRgb}, 0.18)`,
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-1" style={{ color: theme.accentGlow }}>
              <span className="text-[10px] font-bold uppercase tracking-wider">Target Score</span>
              <Target className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className="font-heading font-extrabold text-2xl text-white tracking-tight"
                style={{ textShadow: `0 0 12px rgba(${theme.accentRgb}, 0.6)` }}
              >
                {kpi.targetScore}
              </span>
              <span className="text-xs font-bold" style={{ color: theme.accentPrimary }}>+</span>
              <span className="text-xs font-mono text-slate-400">/ 720</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-medium flex items-center gap-1" style={{ color: theme.accentGlow }}>
            <Sparkles className="w-3 h-3" style={{ color: theme.accentGlow }} />
            <span>NEET 2026 Goal</span>
          </div>
        </div>

        {/* KPI 7: Target Gap */}
        <div className="card-panel p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#8E9AAA] mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Target Gap</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1">
              {kpi.targetGap === 'Target Met' ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Target Met</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-extrabold text-2xl text-rose-400">
                    -{kpi.targetGap}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">marks</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#8E9AAA]">
            {kpi.targetGap === 'Target Met' ? 'Maintain momentum!' : 'To reach 650+ target'}
          </div>
        </div>
      </div>

      {/* ---------------- 2. TOTAL MARKS TRAJECTORY CHART ---------------- */}
      <div className="card-panel p-5 relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className="absolute top-0 left-1/3 w-80 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: `rgba(${theme.accentRgb}, 0.08)` }}
        ></div>

        {/* Chart Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-white tracking-wide">
                Total Marks Trajectory
              </h2>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                style={{
                  backgroundColor: `rgba(${theme.accentRgb}, 0.12)`,
                  color: theme.accentPrimary,
                  border: `1px solid rgba(${theme.accentRgb}, 0.35)`,
                }}
              >
                Max 720
              </span>
            </div>
            <p className="text-xs text-[#8E9AAA] mt-0.5">
              Score progression across NEET mocks relative to the {settings.targetScore} target
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Subject Breakdown Toggle */}
            <button
              onClick={() => setShowSubjectBreakdown(!showSubjectBreakdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={
                showSubjectBreakdown
                  ? {
                      backgroundColor: `rgba(${theme.accentRgb}, 0.18)`,
                      color: theme.accentPrimary,
                      border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                    }
                  : {
                      backgroundColor: '#0E1522',
                      color: '#8E9AAA',
                      border: '1px solid #162438',
                    }
              }
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Subjects</span>
            </button>

            {/* Filter pills */}
            <div className="flex items-center bg-[#090E17] border border-[#162438] rounded-lg p-0.5">
              <button
                onClick={() => setChartFilter('all')}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                style={
                  chartFilter === 'all'
                    ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                    : { color: '#8E9AAA' }
                }
              >
                All ({sortedMocks.length})
              </button>
              <button
                onClick={() => setChartFilter('20')}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                style={
                  chartFilter === '20'
                    ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                    : { color: '#8E9AAA' }
                }
              >
                Last 20
              </button>
              <button
                onClick={() => setChartFilter('10')}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                style={
                  chartFilter === '10'
                    ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                    : { color: '#8E9AAA' }
                }
              >
                Last 10
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Trajectory Line */}
        <div className="h-72 w-full">
          {displayChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <p className="text-sm">No mock test data logged yet.</p>
              <button
                onClick={onOpenAddModal}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                  color: theme.accentPrimary,
                }}
              >
                Log Your First Mock
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accentPrimary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.accentPrimary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#131B2A" vertical={false} />
                <XAxis
                  dataKey="mockNumber"
                  tickFormatter={(val) => `M${val}`}
                  stroke="#475569"
                  tick={{ fill: '#8E9AAA', fontSize: 11 }}
                  axisLine={{ stroke: '#1A2840' }}
                  tickLine={{ stroke: '#1A2840' }}
                />
                <YAxis
                  domain={[300, 720]}
                  ticks={[300, 400, 500, 600, 650, 720]}
                  stroke="#475569"
                  tick={{ fill: '#8E9AAA', fontSize: 11 }}
                  axisLine={{ stroke: '#1A2840' }}
                  tickLine={{ stroke: '#1A2840' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MockTest;
                      return (
                        <div
                          className="p-3 bg-[#080D16]/95 rounded-xl backdrop-blur-md text-xs select-none min-w-[210px]"
                          style={{
                            border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                            boxShadow: `0 0 20px rgba(${theme.accentRgb}, 0.25)`,
                          }}
                        >
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
                            <span className="font-mono font-bold" style={{ color: theme.accentPrimary }}>
                              Mock #{data.mockNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">{data.date}</span>
                          </div>
                          <p className="font-semibold text-white mb-2 truncate max-w-[190px]">
                            {data.name}
                          </p>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Total Score:</span>
                              <span
                                className="font-bold text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `rgba(${theme.accentRgb}, 0.2)`,
                                  color: theme.accentGlow,
                                }}
                              >
                                {data.total} / 720
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-cyan-300">
                              <span>Physics:</span>
                              <span>{data.physics} / 180</span>
                            </div>
                            <div className="flex justify-between items-center text-blue-300">
                              <span>Chemistry:</span>
                              <span>{data.chemistry} / 180</span>
                            </div>
                            <div className="flex justify-between items-center text-purple-300">
                              <span>Biology:</span>
                              <span>{data.biology} / 360</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-300 pt-1 border-t border-slate-800/80">
                              <span>Accuracy:</span>
                              <span>{data.accuracy.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-300">
                              <span>Mistakes:</span>
                              <span>{data.mistakes} Qs</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Target Score Reference Line */}
                <ReferenceLine
                  y={settings.targetScore}
                  stroke={theme.accentGlow}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target (${settings.targetScore})`,
                    position: 'top',
                    fill: theme.accentGlow,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />

                {/* Main Trajectory Line */}
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={theme.accentPrimary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: theme.accentPrimary, stroke: '#080D16', strokeWidth: 2 }}
                  activeDot={{
                    r: 6,
                    fill: theme.accentGlow,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                />

                {/* Optional Subject Breakdown Lines */}
                {showSubjectBreakdown && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="physics"
                      stroke="#00E5FF"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="chemistry"
                      stroke="#38BDF8"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="biology"
                      stroke="#C084FC"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend / Key breakdown under chart */}
        <div className="mt-3 pt-3 border-t border-[#141F32] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-1 rounded-full"
                style={{
                  backgroundColor: theme.accentPrimary,
                  boxShadow: `0 0 6px ${theme.accentPrimary}`,
                }}
              ></span>
              <span className="text-slate-300 font-medium">Total Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 border-t border-dashed"
                style={{ borderColor: theme.accentGlow }}
              ></span>
              <span className="font-medium" style={{ color: theme.accentGlow }}>
                Target Reference ({settings.targetScore})
              </span>
            </div>
            {showSubjectBreakdown && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#00E5FF]"></span>
                  <span className="text-cyan-400">Physics (/180)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#38BDF8]"></span>
                  <span className="text-blue-400">Chemistry (/180)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#C084FC]"></span>
                  <span className="text-purple-400">Biology (/360)</span>
                </div>
              </>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Showing {displayChartData.length} mocks
          </div>
        </div>
      </div>

      {/* ---------------- 3. BOTTOM 3 ANALYTICAL PANELS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel 1: Subject Performance (Left) */}
        <div className="card-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#141F32]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentPrimary }}></span>
                <h3 className="font-heading font-bold text-sm text-white">Subject Performance</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Latest vs Max</span>
            </div>

            {/* Physics */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
                    <span className="font-semibold text-slate-200">Physics</span>
                    <span className="text-[10px] text-slate-500 font-mono">(45 Qs)</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-bold text-white text-xs">{kpi.subjectStats.physics.latest}</span>
                    <span className="text-[11px] text-slate-500">/ 180</span>
                    <span className="text-[10px] text-cyan-400">({kpi.subjectStats.physics.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#121B2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-[#00E5FF] rounded-full shadow-[0_0_8px_rgba(0,229,255,0.4)] transition-all duration-500"
                    style={{ width: `${(kpi.subjectStats.physics.latest / 180) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-[#8E9AAA]">
                  <span>Average: {kpi.subjectStats.physics.average} / 180</span>
                  <span>Target: 160+</span>
                </div>
              </div>

              {/* Chemistry */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008CFF]"></span>
                    <span className="font-semibold text-slate-200">Chemistry</span>
                    <span className="text-[10px] text-slate-500 font-mono">(45 Qs)</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-bold text-white text-xs">{kpi.subjectStats.chemistry.latest}</span>
                    <span className="text-[11px] text-slate-500">/ 180</span>
                    <span className="text-[10px] text-blue-400">({kpi.subjectStats.chemistry.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#121B2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-[#008CFF] rounded-full shadow-[0_0_8px_rgba(0,140,255,0.4)] transition-all duration-500"
                    style={{ width: `${(kpi.subjectStats.chemistry.latest / 180) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-[#8E9AAA]">
                  <span>Average: {kpi.subjectStats.chemistry.average} / 180</span>
                  <span>Target: 165+</span>
                </div>
              </div>

              {/* Biology */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"></span>
                    <span className="font-semibold text-slate-200">Biology</span>
                    <span className="text-[10px] text-slate-500 font-mono">(90 Qs)</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="font-bold text-white text-xs">{kpi.subjectStats.biology.latest}</span>
                    <span className="text-[11px] text-slate-500">/ 360</span>
                    <span className="text-[10px] text-purple-400">({kpi.subjectStats.biology.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#121B2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-[#A855F7] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-500"
                    style={{ width: `${(kpi.subjectStats.biology.latest / 360) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-[#8E9AAA]">
                  <span>Average: {kpi.subjectStats.biology.average} / 360</span>
                  <span>Target: 340+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#141F32] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Full NEET Target:</span>
            <span className="font-mono font-bold" style={{ color: theme.accentGlow }}>160 + 160 + 340 = 660</span>
          </div>
        </div>

        {/* Panel 2: Performance Insights (Center) */}
        <div className="card-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#141F32]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentGlow }}></span>
                <h3 className="font-heading font-bold text-sm text-white">Performance Insights</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Benchmark: {settings.targetScore}</span>
            </div>

            {/* 3 Circular Donut Progress Indicators */}
            <div className="grid grid-cols-3 gap-2.5">
              {renderCircleProgress(
                'Latest',
                kpi.latestScore,
                settings.targetScore,
                'Current mock',
                theme.accentPrimary
              )}
              {renderCircleProgress(
                'Best Score',
                kpi.bestScore,
                settings.targetScore,
                'Peak record',
                '#FBBF24'
              )}
              {renderCircleProgress(
                'Average',
                kpi.averageScore,
                settings.targetScore,
                'Consistency',
                theme.accentGlow
              )}
            </div>
          </div>

          {/* Efficiency Metric Summary */}
          <div className="mt-4 pt-3 border-t border-[#141F32] bg-[#090E17]/60 -mx-1 px-3 py-2 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Readiness:</span>
            </div>
            <span className="font-mono font-bold text-xs" style={{ color: theme.accentPrimary }}>
              {Math.min(100, Math.round((kpi.averageScore / settings.targetScore) * 100))}% Average Index
            </span>
          </div>
        </div>

        {/* Panel 3: Quick Stats & Error Analysis (Right) */}
        <div className="card-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#141F32]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="font-heading font-bold text-sm text-white">Quick Stats & Error Analysis</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">180 Questions</span>
            </div>

            {/* Question Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-[#090E17] border border-[#141F32]">
                <div className="flex items-center gap-1 text-[10px] text-[#8E9AAA] mb-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Attempted</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-base text-white">
                    {latestMock?.attempted || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 180</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090E17] border border-[#141F32]">
                <div className="flex items-center gap-1 text-[10px] text-[#8E9AAA] mb-0.5">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>Mistakes</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-base text-rose-400">
                    {latestMock?.mistakes || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Wrong</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090E17] border border-[#141F32]">
                <div className="flex items-center gap-1 text-[10px] text-[#8E9AAA] mb-0.5">
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  <span>Unattempted</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-base text-amber-300">
                    {latestMock?.unattempted || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Left</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090E17] border border-[#141F32]">
                <div className="flex items-center gap-1 text-[10px] text-[#8E9AAA] mb-0.5">
                  <Percent className="w-3 h-3 text-emerald-400" />
                  <span>Accuracy</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-base text-emerald-400">
                    {(latestMock?.accuracy || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Error Analysis Completion Card */}
            <div
              className="p-3 rounded-xl border flex items-center justify-between transition-colors duration-300"
              style={{
                background: `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.04) 100%)`,
                borderColor: `rgba(${theme.accentRgb}, 0.3)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="w-11 h-11 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" stroke="#141E2F" strokeWidth="3" fill="transparent" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke={theme.accentPrimary}
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - kpi.errorAnalysisPercent / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute font-mono font-bold text-[10px] text-white">
                    {kpi.errorAnalysisPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Error Analysis Rate</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {kpi.errorAnalysisCompletedCount} of {kpi.completedCount} Mocks Reviewed
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Crucial
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 text-center">
            Reviewing mistakes turns negative marks into positive ranks.
          </div>
        </div>
      </div>
    </div>
  );
};
