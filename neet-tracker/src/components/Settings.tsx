import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  BookOpen,
  Palette,
  Check
} from 'lucide-react';
import type { AppSettings, MockTest } from '../types';
import type { ThemeId } from '../types/theme';
import { INITIAL_MOCK_TESTS } from '../data/seedData';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  settings: AppSettings;
  mocks: MockTest[];
  onSaveSettings: (settings: AppSettings) => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onExportCSV: () => void;
  onResetMocks: (mocks: MockTest[]) => void;
  onResetSyllabus?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  mocks,
  onSaveSettings,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onResetMocks,
  onResetSyllabus,
}) => {
  const { theme, themeId, setTheme, availableThemes } = useTheme();
  const [targetScore, setTargetScore] = useState(settings.targetScore);
  const [totalMocksGoal, setTotalMocksGoal] = useState(settings.totalMocksGoal);
  const [studentName, setStudentName] = useState(settings.studentName);
  const [targetCollege, setTargetCollege] = useState(settings.targetCollege);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectTheme = (newThemeId: ThemeId) => {
    setTheme(newThemeId);
    onSaveSettings({
      ...settings,
      targetScore: Number(targetScore) || 650,
      totalMocksGoal: Number(totalMocksGoal) || 200,
      studentName: studentName.trim() || 'Aspirant 2026',
      targetCollege: targetCollege.trim() || 'Top Government Medical College',
      theme: newThemeId,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      targetScore: Number(targetScore) || 650,
      totalMocksGoal: Number(totalMocksGoal) || 200,
      studentName: studentName.trim() || 'Aspirant 2026',
      targetCollege: targetCollege.trim() || 'Top Government Medical College',
      theme: themeId,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToSample = () => {
    if (confirm('Load 18 realistic sample NEET mocks? This will append or replace sample records.')) {
      onResetMocks(INITIAL_MOCK_TESTS);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL mock tests? This cannot be undone unless you have a JSON backup.')) {
      onResetMocks([]);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar transition-colors duration-250"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-lg text-white tracking-wide flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" style={{ color: theme.accentPrimary }} />
          System Preferences & Scoring Blueprint
        </h2>
        <p className="text-xs text-[#8E9AAA] mt-0.5">
          Configure color themes, score benchmarks, storage backups, and examination parameters
        </p>
      </div>

      {/* ---------------- THEME PICKER SECTION ---------------- */}
      <div className="card-panel p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: theme.accentPrimary }} />
            Luxury Dark Color Themes
          </h3>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
            style={{
              backgroundColor: `rgba(${theme.accentRgb}, 0.15)`,
              color: theme.accentPrimary,
              border: `1px solid rgba(${theme.accentRgb}, 0.35)`,
            }}
          >
            Active: {theme.name}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Select your preferred dark luxury aesthetic. Graphs, gauge rings, buttons, and glow effects dynamically adapt instantly.
        </p>

        {/* 5 Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {availableThemes.map((t) => {
            const isSelected = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`relative p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: t.bgPanel,
                  border: isSelected
                    ? `2px solid ${t.accentPrimary}`
                    : `1px solid rgba(${t.accentRgb}, 0.2)`,
                  boxShadow: isSelected
                    ? `0 0 20px rgba(${t.accentRgb}, 0.35)`
                    : 'none',
                }}
              >
                {/* Background accent tint */}
                <div
                  className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: t.accentPrimary }}
                ></div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-bold text-xs text-white">
                      {t.name}
                    </span>
                    {isSelected ? (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: t.accentPrimary }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span
                        className="w-3.5 h-3.5 rounded-full border opacity-40 group-hover:opacity-80"
                        style={{ borderColor: t.accentPrimary }}
                      ></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-3">
                    {t.tagline}
                  </p>
                </div>

                {/* 4 Color Swatch Circles */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                  {t.previewColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={`Color ${index + 1}: ${color}`}
                    />
                  ))}
                  <span
                    className="ml-auto text-[9px] font-mono font-semibold uppercase tracking-wider"
                    style={{ color: t.accentPrimary }}
                  >
                    {isSelected ? 'ACTIVE' : 'SELECT'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- 2-COLUMN SETTINGS BODY ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Target Configuration Form */}
        <div className="space-y-6">
          <div className="card-panel p-5">
            <h3 className="font-heading font-bold text-sm text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentPrimary }}></span>
              Target Benchmarks & Identity
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Customize your target score and 200-mock milestone goals.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Score (Max 720)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="400"
                    max="720"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-36 px-3.5 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] font-mono font-bold text-lg text-white focus:outline-none"
                    required
                  />
                  <span className="text-xs text-[#8E9AAA]">
                    Recommended for AIIMS / Top State GMCs: <strong className="text-white">650–680+</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Mocks Milestone Goal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={totalMocksGoal}
                    onChange={(e) => setTotalMocksGoal(Number(e.target.value))}
                    className="w-36 px-3.5 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] font-mono font-bold text-lg text-white focus:outline-none"
                    required
                  />
                  <span className="text-xs text-[#8E9AAA]">
                    Standard recommended practice regimen: <strong className="text-white">200 Mocks</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Dr. Aryan"
                    className="w-full px-3 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dream Medical Institution
                  </label>
                  <input
                    type="text"
                    value={targetCollege}
                    onChange={(e) => setTargetCollege(e.target.value)}
                    placeholder="e.g. AIIMS New Delhi / MAMC"
                    className="w-full px-3 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accentSecondary}, ${theme.accentPrimary})`,
                    boxShadow: `0 0 15px rgba(${theme.accentRgb}, 0.4)`,
                  }}
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Benchmarks</span>
                </button>

                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Backup & Persistence Panel */}
          <div className="card-panel p-5">
            <h3 className="font-heading font-bold text-sm text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentGlow }}></span>
              Data Persistence & Local JSON Storage
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              All mocks are stored securely offline in your Windows AppData directory. Back up or restore anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export JSON */}
              <button
                onClick={onExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" style={{ color: theme.accentPrimary }} />
                <span>Export JSON Backup</span>
              </button>

              {/* Import JSON */}
              <button
                onClick={onImportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" style={{ color: theme.accentGlow }} />
                <span>Import JSON Backup</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={onExportCSV}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] hover:border-emerald-500/60 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Complete CSV</span>
              </button>

              {/* Reset to 18 realistic sample mocks */}
              <button
                onClick={handleResetToSample}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] hover:border-amber-500/60 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Load 18 Sample Mocks</span>
              </button>

              {/* Reset Syllabus Schedule */}
              {onResetSyllabus && (
                <button
                  onClick={() => {
                    if (window.confirm('Reset all 73 chapters to the default NEET 2026 spaced repetition schedule?')) {
                      onResetSyllabus();
                    }
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] hover:border-cyan-500/60 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Reset Syllabus Schedule</span>
                </button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#141F32] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Currently tracking: <strong className="text-slate-300 font-mono">{mocks.length}</strong> mocks
              </span>
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: NEET UG 2026 Examination Blueprint */}
        <div className="space-y-6">
          <div className="card-panel p-5">
            <h3 className="font-heading font-bold text-sm text-white mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: theme.accentPrimary }} />
              NEET (UG) 2026 Official Pattern & Blueprint
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              National Testing Agency (NTA) official 720-marks framework
            </p>

            <div className="space-y-3 text-xs">
              {/* Physics */}
              <div className="p-3 rounded-xl bg-[#090F1A] border border-cyan-900/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-cyan-400">1. Physics</span>
                  <span className="font-mono font-bold text-white">45 Qs | 180 Marks</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Mechanics, Electrodynamics, Optics, Modern Physics, Thermodynamics.
                </p>
                <div className="mt-1.5 flex gap-2 text-[10px] font-mono text-cyan-300/80">
                  <span>+4 Correct</span>
                  <span>-1 Incorrect</span>
                  <span>0 Unattempted</span>
                </div>
              </div>

              {/* Chemistry */}
              <div className="p-3 rounded-xl bg-[#090F1A] border border-blue-900/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-400">2. Chemistry</span>
                  <span className="font-mono font-bold text-white">45 Qs | 180 Marks</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Physical Chemistry, Inorganic Chemistry, Organic Reaction Mechanisms.
                </p>
                <div className="mt-1.5 flex gap-2 text-[10px] font-mono text-blue-300/80">
                  <span>+4 Correct</span>
                  <span>-1 Incorrect</span>
                  <span>0 Unattempted</span>
                </div>
              </div>

              {/* Biology */}
              <div className="p-3 rounded-xl bg-[#090F1A] border border-purple-900/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-purple-400">3. Biology (Botany + Zoology)</span>
                  <span className="font-mono font-bold text-white">90 Qs | 360 Marks</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Botany (45 Qs - 180 M) & Zoology (45 Qs - 180 M): Genetics, Ecology, Human Physiology.
                </p>
                <div className="mt-1.5 flex gap-2 text-[10px] font-mono text-purple-300/80">
                  <span>+4 Correct</span>
                  <span>-1 Incorrect</span>
                  <span>0 Unattempted</span>
                </div>
              </div>

              {/* Total Summary */}
              <div
                className="p-3 rounded-xl border transition-colors duration-300"
                style={{
                  background: `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.04) 100%)`,
                  borderColor: `rgba(${theme.accentRgb}, 0.3)`,
                }}
              >
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Examination</span>
                  <span className="font-mono" style={{ color: theme.accentGlow }}>
                    180 Questions | 720 Marks
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duration: 200 Minutes (3 Hours 20 Minutes)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
                    <span>Passing benchmark for Top GMCs: 650+ out of 720</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
