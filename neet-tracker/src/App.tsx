import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MockLog } from './components/MockLog';
import { Settings } from './components/Settings';
import { AddMockModal } from './components/AddMockModal';
import { SyllabusTracker } from './components/SyllabusTracker';
import type { MockTest, AppSettings, TabType, ChapterProgress } from './types';
import { DEFAULT_SETTINGS, INITIAL_MOCK_TESTS } from './data/seedData';
import { INITIAL_SYLLABUS_PROGRESS } from './data/syllabusData';
import { StorageService } from './services/storage';
import { computeKPIData } from './utils/calculations';
import { getChapterDueStatus, logRevisionForChapter } from './utils/spacedRepetition';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent: React.FC<{
  mocks: MockTest[];
  syllabus: ChapterProgress[];
  settings: AppSettings;
  onSaveMock: (mock: Omit<MockTest, 'id' | 'mockNumber'> & { id?: string; mockNumber?: number }) => Promise<void>;
  onDeleteMock: (id: string) => Promise<void>;
  onToggleErrorAnalysis: (id: string) => Promise<void>;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onResetMocks: (mocks: MockTest[]) => Promise<void>;
  onUpdateChapter: (id: string, updates: Partial<ChapterProgress>) => Promise<void>;
  onLogRevision: (id: string) => Promise<void>;
  onResetSyllabus: () => Promise<void>;
  onExportJSON: () => Promise<void>;
  onImportJSON: () => Promise<void>;
  onExportCSV: () => Promise<void>;
}> = ({
  mocks,
  syllabus,
  settings,
  onSaveMock,
  onDeleteMock,
  onToggleErrorAnalysis,
  onSaveSettings,
  onResetMocks,
  onUpdateChapter,
  onLogRevision,
  onResetSyllabus,
  onExportJSON,
  onImportJSON,
  onExportCSV,
}) => {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<MockTest | null>(null);

  // Compute live KPIs
  const kpi = computeKPIData(mocks, settings);

  // Active recall due today count for sidebar badge
  const dueTodayCount = syllabus.filter(
    (c) => getChapterDueStatus(c).status === 'due-today'
  ).length;

  // Next mock number
  const nextMockNumber = mocks.length > 0
    ? Math.max(...mocks.map((m) => m.mockNumber)) + 1
    : 1;

  return (
    <div
      className="flex flex-col h-screen w-screen text-[#F5F7FA] overflow-hidden select-none transition-colors duration-250"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* Top Desktop Window Bar */}
      <TitleBar />

      {/* Main App Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          settings={settings}
          onOpenSettings={() => setCurrentTab('settings')}
          dueTodayCount={dueTodayCount}
        />

        {/* Workspace Area: Header + Active Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            kpi={kpi}
            currentTab={currentTab}
            onOpenAddModal={() => {
              setEditingMock(null);
              setIsAddModalOpen(true);
            }}
          />

          <main className="flex-1 overflow-hidden flex flex-col">
            {currentTab === 'dashboard' && (
              <Dashboard
                mocks={mocks}
                kpi={kpi}
                settings={settings}
                onOpenAddModal={() => {
                  setEditingMock(null);
                  setIsAddModalOpen(true);
                }}
                onToggleErrorAnalysis={onToggleErrorAnalysis}
              />
            )}

            {currentTab === 'syllabus' && (
              <SyllabusTracker
                syllabus={syllabus}
                onUpdateChapter={onUpdateChapter}
                onLogRevision={onLogRevision}
                onResetSyllabus={onResetSyllabus}
              />
            )}

            {currentTab === 'mock-log' && (
              <MockLog
                mocks={mocks}
                onOpenAddModal={() => {
                  setEditingMock(null);
                  setIsAddModalOpen(true);
                }}
                onEditMock={(mock) => {
                  setEditingMock(mock);
                  setIsAddModalOpen(true);
                }}
                onDeleteMock={onDeleteMock}
                onToggleErrorAnalysis={onToggleErrorAnalysis}
                onExportCSV={onExportCSV}
              />
            )}

            {currentTab === 'settings' && (
              <Settings
                settings={settings}
                mocks={mocks}
                onSaveSettings={onSaveSettings}
                onExportJSON={onExportJSON}
                onImportJSON={onImportJSON}
                onExportCSV={onExportCSV}
                onResetMocks={onResetMocks}
                onResetSyllabus={onResetSyllabus}
              />
            )}
          </main>
        </div>
      </div>

      {/* Add / Edit Mock Test Modal */}
      <AddMockModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMock(null);
        }}
        onSave={onSaveMock}
        editingMock={editingMock}
        nextMockNumber={nextMockNumber}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [syllabus, setSyllabus] = useState<ChapterProgress[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    async function initData() {
      try {
        const [loadedMocks, loadedSettings, loadedSyllabus] = await Promise.all([
          StorageService.getMocks(),
          StorageService.getSettings(),
          StorageService.getSyllabus(),
        ]);
        setMocks(loadedMocks && loadedMocks.length > 0 ? loadedMocks : INITIAL_MOCK_TESTS);
        setSettings(loadedSettings || DEFAULT_SETTINGS);
        setSyllabus(
          loadedSyllabus && loadedSyllabus.length > 0
            ? loadedSyllabus
            : INITIAL_SYLLABUS_PROGRESS
        );
      } catch (err) {
        console.error('Error loading initial data:', err);
        setMocks(INITIAL_MOCK_TESTS);
        setSyllabus(INITIAL_SYLLABUS_PROGRESS);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Handlers
  const handleSaveMock = async (
    mockData: Omit<MockTest, 'id' | 'mockNumber'> & { id?: string; mockNumber?: number }
  ) => {
    let updatedMocks: MockTest[];

    if (mockData.id) {
      // Editing existing
      updatedMocks = mocks.map((m) =>
        m.id === mockData.id
          ? ({ ...mockData, id: m.id, mockNumber: m.mockNumber } as MockTest)
          : m
      );
    } else {
      // Adding new
      const nextMockNumber = mocks.length > 0
        ? Math.max(...mocks.map((m) => m.mockNumber)) + 1
        : 1;

      const newMock: MockTest = {
        ...mockData,
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        mockNumber: nextMockNumber,
      };
      updatedMocks = [...mocks, newMock];
    }

    setMocks(updatedMocks);
    await StorageService.saveMocks(updatedMocks);
  };

  const handleDeleteMock = async (id: string) => {
    const updated = mocks.filter((m) => m.id !== id);
    setMocks(updated);
    await StorageService.saveMocks(updated);
  };

  const handleToggleErrorAnalysis = async (id: string) => {
    const updated = mocks.map((m) =>
      m.id === id ? { ...m, errorAnalysisDone: !m.errorAnalysisDone } : m
    );
    setMocks(updated);
    await StorageService.saveMocks(updated);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleResetMocks = async (newMocks: MockTest[]) => {
    setMocks(newMocks);
    await StorageService.saveMocks(newMocks);
  };

  // Syllabus Handlers
  const handleUpdateChapter = async (id: string, updates: Partial<ChapterProgress>) => {
    const updated = syllabus.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setSyllabus(updated);
    await StorageService.saveSyllabus(updated);
  };

  const handleLogRevision = async (id: string) => {
    const updated = syllabus.map((c) => (c.id === id ? logRevisionForChapter(c) : c));
    setSyllabus(updated);
    await StorageService.saveSyllabus(updated);
  };

  const handleResetSyllabus = async () => {
    const fresh = await StorageService.resetSyllabus(false);
    setSyllabus(fresh);
  };

  const handleExportJSON = async () => {
    await StorageService.exportJSON(mocks, settings, syllabus);
  };

  const handleImportJSON = async () => {
    const imported = await StorageService.importJSON();
    if (imported) {
      setMocks(imported.mocks);
      setSettings(imported.settings);
      await StorageService.saveMocks(imported.mocks);
      await StorageService.saveSettings(imported.settings);
      if (imported.syllabus && imported.syllabus.length > 0) {
        setSyllabus(imported.syllabus);
        await StorageService.saveSyllabus(imported.syllabus);
      }
      alert(`Successfully imported backup!`);
    }
  };

  const handleExportCSV = async () => {
    await StorageService.exportCSV(mocks);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#05070B] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-[#00A8FF]/50 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(0,168,255,0.4)]">
          <span className="text-[#00A8FF] font-bold text-lg font-heading">N</span>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">Initializing NEET OS 2026 Engine...</p>
      </div>
    );
  }

  return (
    <ThemeProvider initialThemeId={settings.theme}>
      <AppContent
        mocks={mocks}
        syllabus={syllabus}
        settings={settings}
        onSaveMock={handleSaveMock}
        onDeleteMock={handleDeleteMock}
        onToggleErrorAnalysis={handleToggleErrorAnalysis}
        onSaveSettings={handleSaveSettings}
        onResetMocks={handleResetMocks}
        onUpdateChapter={handleUpdateChapter}
        onLogRevision={handleLogRevision}
        onResetSyllabus={handleResetSyllabus}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
      />
    </ThemeProvider>
  );
};

export default App;
