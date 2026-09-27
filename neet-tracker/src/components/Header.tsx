import React from 'react';
import { Plus, Calendar, ArrowRight } from 'lucide-react';
import type { KPIData } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  kpi: KPIData;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ kpi, onOpenAddModal }) => {
  const { theme } = useTheme();

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate circular progress ring stroke
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (kpi.completionPercent / 100) * circumference;

  return (
    <header
      className="h-20 backdrop-blur-md border-b border-[#141E2F] px-6 flex items-center justify-between shrink-0 select-none z-20 transition-colors duration-200"
      style={{ backgroundColor: `${theme.bgHeader}E6` }}
    >
      {/* Left Title & Subtitle */}
      <div>
        <h1 className="font-heading font-bold text-xl text-white tracking-wide flex items-center gap-2">
          NEET MOCK PERFORMANCE
        </h1>
        <p className="text-xs text-[#8E9AAA] font-medium mt-0.5">
          Mock Test Performance & Progress Tracker
        </p>
      </div>

      {/* Center Motivational Banner */}
      <div
        className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.1) 0%, rgba(${theme.accentRgb}, 0.04) 50%, rgba(${theme.accentRgb}, 0.1) 100%)`,
          borderColor: `rgba(${theme.accentRgb}, 0.3)`,
          boxShadow: `0 0 15px rgba(${theme.accentRgb}, 0.15)`,
        }}
      >
        <span className="text-xs font-semibold text-slate-300">Better Attempts</span>
        <ArrowRight className="w-3 h-3" style={{ color: theme.accentGlow }} />
        <span className="text-xs font-semibold" style={{ color: theme.accentPrimary }}>Higher Scores</span>
        <ArrowRight className="w-3 h-3" style={{ color: theme.accentGlow }} />
        <span className="text-xs font-bold tracking-wide" style={{ color: theme.accentGlow }}>
          Your Dream
        </span>
      </div>

      {/* Right Widgets: Progress Ring + Date + Add Mock Button */}
      <div className="flex items-center gap-4">
        {/* Date tag */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#1A2840] text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
          <span>{currentDate}</span>
        </div>

        {/* Circular Mini Progress Ring */}
        <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-[#0E1522] border border-[#1A2840]">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90">
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke="#1A2840"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke={theme.accentPrimary}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-white">
              {Math.round(kpi.completionPercent)}%
            </span>
          </div>

          <div className="text-left">
            <span className="text-[11px] font-mono font-bold text-white block">
              {kpi.completedCount} / {kpi.totalMocksGoal}
            </span>
            <span className="text-[10px] text-[#8E9AAA] block">Mocks Done</span>
          </div>
        </div>

        {/* Primary "+ Add Mock" Glowing Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${theme.accentSecondary}, ${theme.accentPrimary})`,
            boxShadow: `0 0 20px rgba(${theme.accentRgb}, 0.45)`,
          }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Mock</span>
        </button>
      </div>
    </header>
  );
};
