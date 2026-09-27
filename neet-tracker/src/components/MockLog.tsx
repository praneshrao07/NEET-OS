import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';
import type { MockTest } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MockLogProps {
  mocks: MockTest[];
  onOpenAddModal: () => void;
  onEditMock: (mock: MockTest) => void;
  onDeleteMock: (id: string) => void;
  onToggleErrorAnalysis: (id: string) => void;
  onExportCSV: () => void;
}

export const MockLog: React.FC<MockLogProps> = ({
  mocks,
  onOpenAddModal,
  onEditMock,
  onDeleteMock,
  onToggleErrorAnalysis,
  onExportCSV,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [sortField, setSortField] = useState<'mockNumber' | 'date' | 'total' | 'accuracy'>('mockNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter and sort mocks
  const filteredMocks = useMemo(() => {
    return mocks
      .filter((mock) => {
        const matchesSearch =
          mock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mock.mockNumber.toString().includes(searchTerm) ||
          mock.date.includes(searchTerm);

        if (!matchesSearch) return false;

        if (statusFilter === 'done') return mock.errorAnalysisDone;
        if (statusFilter === 'pending') return !mock.errorAnalysisDone;
        return true;
      })
      .sort((a, b) => {
        let valA: number | string = a[sortField];
        let valB: number | string = b[sortField];

        if (sortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [mocks, searchTerm, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredMocks.length / pageSize) || 1;
  const paginatedMocks = filteredMocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'mockNumber' | 'date' | 'total' | 'accuracy') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar flex flex-col transition-colors duration-250"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-lg text-white tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" style={{ color: theme.accentPrimary }} />
            Mock Log Registry
          </h2>
          <p className="text-xs text-[#8E9AAA] mt-0.5">
            Complete records of all attempted NEET (UG) 2026 practice tests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E1522] border border-[#1A2840] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download CSV for Excel / Sheets"
          >
            <Download className="w-3.5 h-3.5" style={{ color: theme.accentGlow }} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.accentSecondary}, ${theme.accentPrimary})`,
              boxShadow: `0 0 15px rgba(${theme.accentRgb}, 0.4)`,
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Mock</span>
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="card-panel p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by test name, # or date..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070A0F] border border-[#141F32] text-xs text-white placeholder-slate-500 focus:outline-none"
            style={{ borderColor: undefined }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-[#070A0F] border border-[#141F32] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className="px-3 py-1 rounded-md transition-colors cursor-pointer"
              style={
                statusFilter === 'all'
                  ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                  : { color: '#8E9AAA' }
              }
            >
              All ({mocks.length})
            </button>
            <button
              onClick={() => { setStatusFilter('done'); setCurrentPage(1); }}
              className="px-3 py-1 rounded-md transition-colors cursor-pointer"
              style={
                statusFilter === 'done'
                  ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                  : { color: '#8E9AAA' }
              }
            >
              Analyzed ({mocks.filter(m => m.errorAnalysisDone).length})
            </button>
            <button
              onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
              className="px-3 py-1 rounded-md transition-colors cursor-pointer"
              style={
                statusFilter === 'pending'
                  ? { backgroundColor: theme.accentPrimary, color: '#ffffff', fontWeight: 600 }
                  : { color: '#8E9AAA' }
              }
            >
              Pending ({mocks.filter(m => !m.errorAnalysisDone).length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="card-panel overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#090F1A] border-b border-[#141F32] text-[#8E9AAA] font-semibold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => toggleSort('mockNumber')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Mock #</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Mock Name</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-cyan-400">Physics (/180)</th>
                <th className="py-3 px-3 text-blue-400">Chemistry (/180)</th>
                <th className="py-3 px-3 text-purple-400">Biology (/360)</th>
                <th
                  onClick={() => toggleSort('total')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-white font-bold"
                >
                  <div className="flex items-center gap-1">
                    <span>Total (/720)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-slate-300">Attempted</th>
                <th className="py-3 px-3 text-rose-400">Mistakes</th>
                <th
                  onClick={() => toggleSort('accuracy')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-emerald-400"
                >
                  <div className="flex items-center gap-1">
                    <span>Accuracy</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Error Analysis</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121B2A] font-mono">
              {paginatedMocks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-sans">
                    No mock tests found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedMocks.map((mock) => {
                  const isTargetMet = mock.total >= 650;
                  return (
                    <tr
                      key={mock.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Mock # */}
                      <td className="py-3 px-3.5 font-bold" style={{ color: theme.accentPrimary }}>
                        #{mock.mockNumber}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-sans font-medium text-white max-w-[200px] truncate">
                        <span title={mock.name}>{mock.name}</span>
                        {mock.notes && (
                          <span
                            className="block text-[10px] text-slate-500 truncate"
                            title={mock.notes}
                          >
                            {mock.notes}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {mock.date}
                      </td>

                      {/* Physics */}
                      <td className="py-3 px-3 text-cyan-300 font-semibold">
                        {mock.physics}
                      </td>

                      {/* Chemistry */}
                      <td className="py-3 px-3 text-blue-300 font-semibold">
                        {mock.chemistry}
                      </td>

                      {/* Biology */}
                      <td className="py-3 px-3 text-purple-300 font-semibold">
                        {mock.biology}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                            isTargetMet
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/10 text-white border border-slate-700'
                          }`}
                        >
                          {mock.total}
                        </span>
                      </td>

                      {/* Attempted */}
                      <td className="py-3 px-3 text-slate-300">
                        {mock.attempted} <span className="text-slate-600">/ 180</span>
                      </td>

                      {/* Mistakes */}
                      <td className="py-3 px-3 text-rose-400 font-semibold">
                        {mock.mistakes}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3 px-3 text-emerald-400 font-bold">
                        {mock.accuracy.toFixed(1)}%
                      </td>

                      {/* Error Analysis Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleErrorAnalysis(mock.id)}
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title={
                            mock.errorAnalysisDone
                              ? 'Error Analysis Completed (Click to toggle)'
                              : 'Pending Error Analysis (Click to mark done)'
                          }
                        >
                          {mock.errorAnalysisDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-500 hover:text-amber-400" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditMock(mock)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Mock Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete Mock #${mock.mockNumber} (${mock.name})?`)) {
                                onDeleteMock(mock.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Mock Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-[#141F32] bg-[#090F1A] flex items-center justify-between text-xs text-slate-400 font-sans">
          <div>
            Showing <span className="text-white font-mono font-semibold">{paginatedMocks.length}</span> of{' '}
            <span className="text-white font-mono font-semibold">{filteredMocks.length}</span> mocks
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-[#0E1626] border border-[#1A2840] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-xs text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-[#0E1626] border border-[#1A2840] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
