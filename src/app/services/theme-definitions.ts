export type SeasonalTheme = 'default' | 'christmas' | 'easter' | 'carnival' | 'spring' | 'halloween' | 'summer' | 'valentine';

export interface ThemeDefinition {
  id: SeasonalTheme;
  name: string;
  emoji: string;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgCard: string;
    bgHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderColor: string;
    accentPrimary: string;
    accentHover: string;
    accentGlow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradient: string;
}

export const themes: Record<SeasonalTheme, ThemeDefinition> = {
  default: {
    id: 'default',
    name: 'Défaut',
    emoji: '🎨',
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
      bgCard: '#1e293b',
      bgHover: '#252f47',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      borderColor: '#334155',
      accentPrimary: '#38bdf8',
      accentHover: '#0ea5e9',
      accentGlow: 'rgba(56, 189, 248, 0.3)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
  },
  
  christmas: {
    id: 'christmas',
    name: 'Noël',
    emoji: '🎄',
    colors: {
      bgPrimary: '#0c1f1a',
      bgSecondary: '#1a3d2e',
      bgTertiary: '#2d5a45',
      bgCard: '#143828',
      bgHover: '#1e4a35',
      textPrimary: '#ffffff',
      textSecondary: '#a8dcc0',
      textMuted: '#6b9b7e',
      borderColor: '#2d5a45',
      accentPrimary: '#dc2626',
      accentHover: '#b91c1c',
      accentGlow: 'rgba(220, 38, 38, 0.4)',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#ef4444',
      info: '#60a5fa',
    },
    gradient: 'linear-gradient(135deg, #0c1f1a 0%, #1a3d2e 50%, #7f1d1d 100%)'
  },
  
  easter: {
    id: 'easter',
    name: 'Pâques',
    emoji: '🐰',
    colors: {
      bgPrimary: '#fdf4ff',
      bgSecondary: '#ffffff',
      bgTertiary: '#fae8ff',
      bgCard: '#ffffff',
      bgHover: '#fce7f3',
      textPrimary: '#831843',
      textSecondary: '#a21caf',
      textMuted: '#c026d3',
      borderColor: '#f0abfc',
      accentPrimary: '#db2777',
      accentHover: '#be185d',
      accentGlow: 'rgba(219, 39, 119, 0.3)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#60a5fa',
    },
    gradient: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #e0f2fe 100%)'
  },
  
  carnival: {
    id: 'carnival',
    name: 'Carnaval',
    emoji: '🎭',
    colors: {
      bgPrimary: '#1a1a2e',
      bgSecondary: '#16213e',
      bgTertiary: '#0f3460',
      bgCard: '#1a1a3e',
      bgHover: '#252550',
      textPrimary: '#ffffff',
      textSecondary: '#ffd700',
      textMuted: '#d4af37',
      borderColor: '#e94560',
      accentPrimary: '#f72585',
      accentHover: '#b5179e',
      accentGlow: 'rgba(247, 37, 133, 0.4)',
      success: '#4cc9f0',
      warning: '#ffd700',
      error: '#e94560',
      info: '#4cc9f0',
    },
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #ff006e 25%, #8338ec 50%, #3a86ff 100%)'
  },
  
  spring: {
    id: 'spring',
    name: 'Printemps',
    emoji: '🌸',
    colors: {
      bgPrimary: '#ecfdf5',
      bgSecondary: '#ffffff',
      bgTertiary: '#d1fae5',
      bgCard: '#ffffff',
      bgHover: '#f0fdf4',
      textPrimary: '#064e3b',
      textSecondary: '#059669',
      textMuted: '#34d399',
      borderColor: '#a7f3d0',
      accentPrimary: '#10b981',
      accentHover: '#059669',
      accentGlow: 'rgba(16, 185, 129, 0.3)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#60a5fa',
    },
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #fce7f3 50%, #e0f2fe 100%)'
  },
  
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#2d2d2d',
      bgCard: '#1a1a1a',
      bgHover: '#2a2a2a',
      textPrimary: '#ffffff',
      textSecondary: '#fb923c',
      textMuted: '#a8a29e',
      borderColor: '#7c2d12',
      accentPrimary: '#f97316',
      accentHover: '#ea580c',
      accentGlow: 'rgba(249, 115, 22, 0.4)',
      success: '#84cc16',
      warning: '#fbbf24',
      error: '#dc2626',
      info: '#60a5fa',
    },
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #7c2d12 100%)'
  },
  
  summer: {
    id: 'summer',
    name: 'Été',
    emoji: '☀️',
    colors: {
      bgPrimary: '#0c4a6e',
      bgSecondary: '#075985',
      bgTertiary: '#0369a1',
      bgCard: '#075985',
      bgHover: '#0ea5e9',
      textPrimary: '#ffffff',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      borderColor: '#0284c7',
      accentPrimary: '#fbbf24',
      accentHover: '#f59e0b',
      accentGlow: 'rgba(251, 191, 36, 0.4)',
      success: '#22c55e',
      warning: '#f97316',
      error: '#ef4444',
      info: '#38bdf8',
    },
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #f59e0b 100%)'
  },
  
  valentine: {
    id: 'valentine',
    name: 'Saint-Valentin',
    emoji: '💕',
    colors: {
      bgPrimary: '#4a0d26',
      bgSecondary: '#631331',
      bgTertiary: '#7f1d44',
      bgCard: '#631331',
      bgHover: '#7f1d4d',
      textPrimary: '#ffffff',
      textSecondary: '#fecdd3',
      textMuted: '#fda4af',
      borderColor: '#9d174d',
      accentPrimary: '#fb7185',
      accentHover: '#f43f5e',
      accentGlow: 'rgba(251, 113, 133, 0.4)',
      success: '#f472b6',
      warning: '#fbbf24',
      error: '#e11d48',
      info: '#60a5fa',
    },
    gradient: 'linear-gradient(135deg, #4a0d26 0%, #7f1d44 50%, #be123c 100%)'
  }
};
