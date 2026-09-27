import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Sparkles, Calculator } from 'lucide-react';
import type { MockTest } from '../types';
import { calculateMockFields } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

interface AddMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mock: Omit<MockTest, 'id' | 'mockNumber'> & { id?: string; mockNumber?: number }) => void;
  editingMock?: MockTest | null;
  nextMockNumber: number;
}

export const AddMockModal: React.FC<AddMockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMock,
  nextMockNumber,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [physics, setPhysics] = useState<number | ''>(140);
  const [chemistry, setChemistry] = useState<number | ''>(145);
  const [biology, setBiology] = useState<number | ''>(310);
  const [attempted, setAttempted] = useState<number | ''>(165);
  const [mistakes, setMistakes] = useState<number | ''>(15);
  const [errorAnalysisDone, setErrorAnalysisDone] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingMock) {
      setName(editingMock.name);
      setDate(editingMock.date);
      setPhysics(editingMock.physics);
      setChemistry(editingMock.chemistry);
      setBiology(editingMock.biology);
      setAttempted(editingMock.attempted);
      setMistakes(editingMock.mistakes);
      setErrorAnalysisDone(editingMock.errorAnalysisDone);
      setNotes(editingMock.notes || '');
    } else {
      setName(`NEET Mock Test #${nextMockNumber}`);
      setDate(new Date().toISOString().slice(0, 10));
      setPhysics(140);
      setChemistry(145);
      setBiology(310);
      setAttempted(165);
      setMistakes(15);
      setErrorAnalysisDone(false);
      setNotes('');
    }
    setErrors([]);
  }, [editingMock, isOpen, nextMockNumber]);

  if (!isOpen) return null;

  // Real-time calculated preview
  const calc = calculateMockFields({
    physics: typeof physics === 'number' ? physics : 0,
    chemistry: typeof chemistry === 'number' ? chemistry : 0,
    biology: typeof biology === 'number' ? biology : 0,
    attempted: typeof attempted === 'number' ? attempted : 0,
    mistakes: typeof mistakes === 'number' ? mistakes : 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    const numPhysics = Number(physics);
    const numChem = Number(chemistry);
    const numBio = Number(biology);
    const numAttempted = Number(attempted);
    const numMistakes = Number(mistakes);

    if (!name.trim()) newErrors.push('Please enter a mock test name.');
    if (!date) newErrors.push('Please select a date.');

    if (isNaN(numPhysics) || numPhysics < 0 || numPhysics > 180) {
      newErrors.push('Physics score must be between 0 and 180.');
    }
    if (isNaN(numChem) || numChem < 0 || numChem > 180) {
      newErrors.push('Chemistry score must be between 0 and 180.');
    }
    if (isNaN(numBio) || numBio < 0 || numBio > 360) {
      newErrors.push('Biology score must be between 0 and 360.');
    }
    if (isNaN(numAttempted) || numAttempted < 0 || numAttempted > 180) {
      newErrors.push('Attempted questions must be between 0 and 180.');
    }
    if (isNaN(numMistakes) || numMistakes < 0 || numMistakes > numAttempted) {
      newErrors.push('Mistakes cannot be negative or exceed attempted questions.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: editingMock ? editingMock.id : undefined,
      mockNumber: editingMock ? editingMock.mockNumber : undefined,
      name: name.trim(),
      date,
      physics: calc.physics,
      chemistry: calc.chemistry,
      biology: calc.biology,
      total: calc.total,
      attempted: calc.attempted,
      mistakes: calc.mistakes,
      correct: calc.correct,
      unattempted: calc.unattempted,
      accuracy: calc.accuracy,
      errorAnalysisDone,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#080D16] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300"
        style={{
          border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
          boxShadow: `0 0 40px rgba(${theme.accentRgb}, 0.25)`,
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#141F32] flex items-center justify-between bg-[#0B121E]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `rgba(${theme.accentRgb}, 0.15)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
              }}
            >
              <Calculator className="w-4 h-4" style={{ color: theme.accentPrimary }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                {editingMock ? `Edit Mock #${editingMock.mockNumber}` : `Log Mock Test #${nextMockNumber}`}
              </h2>
              <p className="text-xs text-[#8E9AAA]">
                NEET UG 2026 Examination Scoring & Auto-Calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Validation Banner if any */}
          {errors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200 pl-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Details: Name and Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mock Test Name / Institute
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Allen Major Test 04 / Aakash AIATS"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-sm text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Test Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-sm text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Subject Marks (Strictly NEET UG 2026: Physics 180, Chem 180, Bio 360) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E9AAA]">
                Subject Marks Breakdown
              </span>
              <span className="text-[11px] font-mono text-slate-400">Total Available: 720 Marks</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Physics */}
              <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] focus-within:border-cyan-400 transition-colors">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-cyan-400">Physics</span>
                  <span className="text-[10px] text-slate-400 font-mono">Max 180</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={physics}
                  onChange={(e) => setPhysics(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-white focus:outline-none"
                  placeholder="0"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">45 Questions</span>
              </div>

              {/* Chemistry */}
              <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] focus-within:border-blue-400 transition-colors">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-blue-400">Chemistry</span>
                  <span className="text-[10px] text-slate-400 font-mono">Max 180</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={chemistry}
                  onChange={(e) => setChemistry(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-white focus:outline-none"
                  placeholder="0"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">45 Questions</span>
              </div>

              {/* Biology */}
              <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1A2840] focus-within:border-purple-400 transition-colors">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-purple-400">Biology</span>
                  <span className="text-[10px] text-slate-400 font-mono">Max 360</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={biology}
                  onChange={(e) => setBiology(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-white focus:outline-none"
                  placeholder="0"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">90 Qs (Bot + Zoo)</span>
              </div>
            </div>
          </div>

          {/* Questions Metrics: Attempted & Mistakes */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E9AAA] block mb-1.5">
              Question Attempt Analysis
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1A2840]">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-300">Attempted Questions</span>
                  <span className="text-[10px] text-slate-400 font-mono">out of 180</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={attempted}
                  onChange={(e) => setAttempted(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-white focus:outline-none"
                  placeholder="0"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1A2840]">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-rose-400">Mistakes (Incorrect)</span>
                  <span className="text-[10px] text-rose-400/80 font-mono">-1 each</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={typeof attempted === 'number' ? attempted : 180}
                  value={mistakes}
                  onChange={(e) => setMistakes(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-bold text-xl text-rose-400 focus:outline-none"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* LIVE AUTO-CALCULATION PREVIEW CARD */}
          <div
            className="p-4 rounded-xl transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(7, 13, 24, 0.95) 100%)`,
              border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
              boxShadow: `0 0 20px rgba(${theme.accentRgb}, 0.15)`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: theme.accentPrimary }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accentGlow }} />
                Live Auto-Calculations Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">Strict NEET Formula</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#14233C] text-center font-mono">
              <div className="p-2 rounded-lg bg-[#070B14]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Total Score</span>
                <span className="font-bold text-base text-white">{calc.total}</span>
                <span className="text-[10px] text-slate-500 block">/ 720</span>
              </div>

              <div className="p-2 rounded-lg bg-[#070B14]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Correct Qs</span>
                <span className="font-bold text-base text-emerald-400">{calc.correct}</span>
                <span className="text-[10px] text-slate-500 block">+{calc.correct * 4}</span>
              </div>

              <div className="p-2 rounded-lg bg-[#070B14]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Unattempted</span>
                <span className="font-bold text-base text-amber-300">{calc.unattempted}</span>
                <span className="text-[10px] text-slate-500 block">0 marks</span>
              </div>

              <div className="p-2 rounded-lg bg-[#070B14]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Accuracy</span>
                <span className="font-bold text-base" style={{ color: theme.accentGlow }}>
                  {calc.accuracy}%
                </span>
                <span className="text-[10px] text-slate-500 block">Strike Rate</span>
              </div>
            </div>
          </div>

          {/* Error Analysis Toggle & Review Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1522] border border-[#1A2840]">
              <div>
                <span className="text-xs font-semibold text-white block">Error Analysis Completed</span>
                <span className="text-[11px] text-slate-400 block">
                  Have you thoroughly reviewed incorrect questions and logged doubts?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setErrorAnalysisDone(!errorAnalysisDone)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: errorAnalysisDone ? theme.accentPrimary : '#1A2840',
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    errorAnalysisDone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Post-Mock Notes / Weak Areas (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need revision in Optics formulas and Chemical Kinetics numericals..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Actions Footer */}
        <div className="px-6 py-3.5 border-t border-[#141F32] flex items-center justify-end gap-3 bg-[#0B121E]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.accentSecondary}, ${theme.accentPrimary})`,
              boxShadow: `0 0 15px rgba(${theme.accentRgb}, 0.4)`,
            }}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{editingMock ? 'Save Changes' : 'Record Mock Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
