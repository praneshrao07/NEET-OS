export type ThemeId =
  | 'electric-blue'
  | 'emerald-matrix'
  | 'cyberpunk-amber'
  | 'neon-violet'
  | 'crimson-stealth';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  bgPrimary: string;
  bgPanel: string;
  bgHeader: string;
  bgSidebar: string;
  borderPanel: string;
  accentPrimary: string;
  accentGlow: string;
  accentSecondary: string;
  accentRgb: string;
  glowRgb: string;
  previewColors: [string, string, string, string]; // [bg, panel, accent, glow]
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'electric-blue': {
    id: 'electric-blue',
    name: 'Electric Blue',
    tagline: 'Luxury Tech & Pure Medical Dark',
    bgPrimary: '#05070B',
    bgPanel: '#0B1018',
    bgHeader: '#080B11',
    bgSidebar: '#080B11',
    borderPanel: 'rgba(0, 168, 255, 0.15)',
    accentPrimary: '#00A8FF',
    accentGlow: '#20D9FF',
    accentSecondary: '#008CFF',
    accentRgb: '0, 168, 255',
    glowRgb: '32, 217, 255',
    previewColors: ['#05070B', '#0B1018', '#00A8FF', '#20D9FF'],
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    tagline: 'Forest Green Precision & Biology Focus',
    bgPrimary: '#050B08',
    bgPanel: '#091610',
    bgHeader: '#07120D',
    bgSidebar: '#07120D',
    borderPanel: 'rgba(16, 185, 129, 0.15)',
    accentPrimary: '#10B981',
    accentGlow: '#34D399',
    accentSecondary: '#059669',
    accentRgb: '16, 185, 129',
    glowRgb: '52, 211, 153',
    previewColors: ['#050B08', '#091610', '#10B981', '#34D399'],
  },
  'cyberpunk-amber': {
    id: 'cyberpunk-amber',
    name: 'Cyberpunk Amber',
    tagline: 'Gold Sunset & High-Stakes Focus',
    bgPrimary: '#0C0804',
    bgPanel: '#16110B',
    bgHeader: '#130E08',
    bgSidebar: '#130E08',
    borderPanel: 'rgba(245, 158, 11, 0.15)',
    accentPrimary: '#F59E0B',
    accentGlow: '#FBBF24',
    accentSecondary: '#D97706',
    accentRgb: '245, 158, 11',
    glowRgb: '251, 191, 36',
    previewColors: ['#0C0804', '#16110B', '#F59E0B', '#FBBF24'],
  },
  'neon-violet': {
    id: 'neon-violet',
    name: 'Neon Violet',
    tagline: 'Deep Purple & Quantum Atmosphere',
    bgPrimary: '#0A0612',
    bgPanel: '#130D22',
    bgHeader: '#0F091C',
    bgSidebar: '#0F091C',
    borderPanel: 'rgba(139, 92, 246, 0.15)',
    accentPrimary: '#8B5CF6',
    accentGlow: '#A78BFA',
    accentSecondary: '#7C3AED',
    accentRgb: '139, 92, 246',
    glowRgb: '167, 139, 250',
    previewColors: ['#0A0612', '#130D22', '#8B5CF6', '#A78BFA'],
  },
  'crimson-stealth': {
    id: 'crimson-stealth',
    name: 'Crimson Stealth',
    tagline: 'Ruby Red & Competitive Edge',
    bgPrimary: '#0D0506',
    bgPanel: '#170A0D',
    bgHeader: '#13070A',
    bgSidebar: '#13070A',
    borderPanel: 'rgba(239, 68, 68, 0.15)',
    accentPrimary: '#EF4444',
    accentGlow: '#F87171',
    accentSecondary: '#DC2626',
    accentRgb: '239, 68, 68',
    glowRgb: '248, 113, 113',
    previewColors: ['#0D0506', '#170A0D', '#EF4444', '#F87171'],
  },
};
