import type { MockTest, AppSettings } from '../types';
import { INITIAL_MOCK_TESTS, DEFAULT_SETTINGS } from '../data/seedData';

// Augment window object for Electron API bridge
declare global {
  interface Window {
    electronAPI?: {
      getMocks: () => Promise<MockTest[]>;
      saveMocks: (mocks: MockTest[]) => Promise<boolean>;
      getSettings: () => Promise<AppSettings>;
      saveSettings: (settings: AppSettings) => Promise<boolean>;
      exportData: (content: string, defaultFileName: string, filterName: string, extensions: string[]) => Promise<boolean>;
      importData: () => Promise<string | null>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isMaximized: () => Promise<boolean>;
    };
  }
}

const STORAGE_KEYS = {
  MOCKS: 'neet_mock_tracker_mocks_v1',
  SETTINGS: 'neet_mock_tracker_settings_v1',
};

export const StorageService = {
  async getMocks(): Promise<MockTest[]> {
    if (window.electronAPI) {
      try {
        const electronMocks = await window.electronAPI.getMocks();
        if (electronMocks && electronMocks.length > 0) {
          return electronMocks;
        }
      } catch (err) {
        console.warn('Error reading from Electron storage, falling back:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOCKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading localStorage mocks:', e);
    }

    // Default seed data
    await this.saveMocks(INITIAL_MOCK_TESTS);
    return INITIAL_MOCK_TESTS;
  },

  async saveMocks(mocks: MockTest[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify(mocks));
    } catch (e) {
      console.error('Failed saving to localStorage:', e);
    }

    if (window.electronAPI) {
      try {
        await window.electronAPI.saveMocks(mocks);
      } catch (err) {
        console.error('Failed saving to Electron AppData:', err);
      }
    }
  },

  async getSettings(): Promise<AppSettings> {
    if (window.electronAPI) {
      try {
        const electronSettings = await window.electronAPI.getSettings();
        if (electronSettings && electronSettings.targetScore) {
          return electronSettings;
        }
      } catch (err) {
        console.warn('Error reading Electron settings, falling back:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed reading localStorage settings:', e);
    }

    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving settings to localStorage:', e);
    }

    if (window.electronAPI) {
      try {
        await window.electronAPI.saveSettings(settings);
      } catch (err) {
        console.error('Failed saving settings to Electron:', err);
      }
    }
  },

  async exportJSON(mocks: MockTest[], settings: AppSettings): Promise<void> {
    const payload = JSON.stringify({
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      settings,
      mocks,
    }, null, 2);

    const fileName = `neet-mocks-backup-${new Date().toISOString().slice(0, 10)}.json`;

    if (window.electronAPI) {
      await window.electronAPI.exportData(payload, fileName, 'JSON Files', ['json']);
      return;
    }

    // Web fallback
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportCSV(mocks: MockTest[]): Promise<void> {
    const headers = [
      'Mock Number',
      'Mock Name',
      'Date',
      'Physics (/180)',
      'Chemistry (/180)',
      'Biology (/360)',
      'Total Marks (/720)',
      'Attempted (/180)',
      'Mistakes',
      'Correct',
      'Unattempted',
      'Accuracy %',
      'Error Analysis Done',
      'Notes'
    ];

    const rows = mocks.map(m => [
      m.mockNumber,
      `"${m.name.replace(/"/g, '""')}"`,
      m.date,
      m.physics,
      m.chemistry,
      m.biology,
      m.total,
      m.attempted,
      m.mistakes,
      m.correct,
      m.unattempted,
      m.accuracy.toFixed(1),
      m.errorAnalysisDone ? 'Yes' : 'No',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const fileName = `neet-mock-records-${new Date().toISOString().slice(0, 10)}.csv`;

    if (window.electronAPI) {
      await window.electronAPI.exportData(csvContent, fileName, 'CSV Files', ['csv']);
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importJSON(): Promise<{ mocks: MockTest[]; settings: AppSettings } | null> {
    let rawContent: string | null = null;

    if (window.electronAPI) {
      rawContent = await window.electronAPI.importData();
    } else {
      rawContent = await new Promise<string | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
        };
        input.click();
      });
    }

    if (!rawContent) return null;

    try {
      const data = JSON.parse(rawContent);
      if (Array.isArray(data)) {
        return { mocks: data, settings: DEFAULT_SETTINGS };
      }
      if (data.mocks && Array.isArray(data.mocks)) {
        return {
          mocks: data.mocks,
          settings: data.settings || DEFAULT_SETTINGS,
        };
      }
      throw new Error('Unrecognized mock data format');
    } catch (err) {
      console.error('Failed to parse imported JSON:', err);
      alert('Failed to parse imported JSON file. Please ensure it is a valid NEET Mock Tracker backup.');
      return null;
    }
  }
};
