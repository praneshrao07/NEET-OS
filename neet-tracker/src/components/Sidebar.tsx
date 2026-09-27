import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Edit2
} from 'lucide-react';
import type { TabType, AppSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onOpenSettings,
}) => {
  const { theme } = useTheme();

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mock-log', label: 'Mock Log', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className="w-64 border-r border-[#141E2F] flex flex-col justify-between shrink-0 select-none h-full transition-colors duration-200"
      style={{ backgroundColor: theme.bgSidebar }}
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-6 border-b border-[#141E2F]/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden relative p-0.5"
              style={{
                boxShadow: `0 0 16px rgba(${theme.accentRgb}, 0.35)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                background: `linear-gradient(135deg, rgba(${theme.accentRgb}, 0.2), rgba(${theme.accentRgb}, 0.05))`,
              }}
            >
              <img src="/icon.png" alt="NEET OS" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-base tracking-wider text-white">
                  NEET OS
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{
                    backgroundColor: `rgba(${theme.accentRgb}, 0.15)`,
                    color: theme.accentPrimary,
                    border: `1px solid rgba(${theme.accentRgb}, 0.35)`,
                  }}
                >
                  2026
                </span>
              </div>
              <p className="text-[11px] text-[#8E9AAA] font-medium tracking-wide">
                ANALYTICS SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'font-semibold'
                    : 'text-[#8E9AAA] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `rgba(${theme.accentRgb}, 0.14)`,
                        color: theme.accentPrimary,
                        border: `1px solid rgba(${theme.accentRgb}, 0.4)`,
                        boxShadow: `0 0 15px rgba(${theme.accentRgb}, 0.25)`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={{ color: isActive ? theme.accentPrimary : undefined }}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: theme.accentPrimary,
                      boxShadow: `0 0 6px ${theme.accentPrimary}`,
                    }}
                  ></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar Card */}
      <div className="p-4 space-y-3">
        {/* Target summary panel */}
        <div
          className="p-3.5 rounded-2xl border relative overflow-hidden transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${theme.bgPanel} 0%, rgba(${theme.accentRgb}, 0.05) 100%)`,
            borderColor: `rgba(${theme.accentRgb}, 0.25)`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: `rgba(${theme.accentRgb}, 0.08)` }}
          ></div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E9AAA] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" style={{ color: theme.accentPrimary }} />
              Target Score
            </span>
            <button
              onClick={onOpenSettings}
              className="p-1 text-[#8E9AAA] hover:text-white rounded transition-colors"
              style={{ color: undefined }}
              title="Edit Target Score in Settings"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
                {settings.targetScore}
              </span>
              <span className="text-xs font-semibold" style={{ color: theme.accentPrimary }}>+</span>
              <span className="text-[11px] text-slate-500 font-mono">/ 720</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total Qs</span>
              <span className="text-xs font-mono font-bold text-slate-200">180</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
            <div
              className="w-0.5 h-5 rounded-full"
              style={{
                backgroundColor: theme.accentGlow,
                boxShadow: `0 0 6px ${theme.accentGlow}`,
              }}
            ></div>
            <span
              className="text-[10px] font-bold tracking-wider uppercase"
              style={{ color: theme.accentGlow }}
            >
              SMALL STEPS BIG RESULTS
            </span>
          </div>
        </div>

        {/* User / Aspirant profile indicator */}
        <div className="px-3 py-2 rounded-xl bg-[#090E17]/80 border border-[#141E2F] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">
              {settings.studentName || 'Doctor 2026'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {settings.targetCollege || 'Dream GMC Target'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
