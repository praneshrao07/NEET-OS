import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MockLog } from './components/MockLog';
import { Settings } from './components/Settings';
import { AddMockModal } from './components/AddMockModal';
import type { MockTest, AppSettings, TabType } from './types';
import { DEFAULT_SETTINGS, INITIAL_MOCK_TESTS } from './data/seedData';
import { StorageService } from './services/storage';
import { computeKPIData } from './utils/calculations';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent: React.FC<{
  mocks: MockTest[];
  settings: AppSettings;
  onSaveMock: (mock: Omit<MockTest, 'id' | 'mockNumber'> & { id?: string; mockNumber?: number }) => Promise<void>;
  onDeleteMock: (id: string) => Promise<void>;
  onToggleErrorAnalysis: (id: string) => Promise<void>;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onResetMocks: (mocks: MockTest[]) => Promise<void>;
  onExportJSON: () => Promise<void>;
  onImportJSON: () => Promise<void>;
  onExportCSV: () => Promise<void>;
}> = ({
  mocks,
  settings,
  onSaveMock,
  onDeleteMock,
  onToggleErrorAnalysis,
  onSaveSettings,
  onResetMocks,
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
        />

        {/* Workspace Area: Header + Active Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            kpi={kpi}
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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    async function initData() {
      try {
        const [loadedMocks, loadedSettings] = await Promise.all([
          StorageService.getMocks(),
          StorageService.getSettings(),
        ]);
        setMocks(loadedMocks && loadedMocks.length > 0 ? loadedMocks : INITIAL_MOCK_TESTS);
        setSettings(loadedSettings || DEFAULT_SETTINGS);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setMocks(INITIAL_MOCK_TESTS);
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

  const handleExportJSON = async () => {
    await StorageService.exportJSON(mocks, settings);
  };

  const handleImportJSON = async () => {
    const imported = await StorageService.importJSON();
    if (imported) {
      setMocks(imported.mocks);
      setSettings(imported.settings);
      await StorageService.saveMocks(imported.mocks);
      await StorageService.saveSettings(imported.settings);
      alert(`Successfully imported ${imported.mocks.length} mock tests!`);
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
        settings={settings}
        onSaveMock={handleSaveMock}
        onDeleteMock={handleDeleteMock}
        onToggleErrorAnalysis={handleToggleErrorAnalysis}
        onSaveSettings={handleSaveSettings}
        onResetMocks={handleResetMocks}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
      />
    </ThemeProvider>
  );
};

export default App;
