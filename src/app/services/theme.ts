import { Injectable, signal, effect, computed } from '@angular/core';
import { SeasonalTheme, themes, ThemeDefinition } from './theme-definitions';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY_MODE = 'square-circle-theme-mode';
  private readonly STORAGE_KEY_SEASONAL = 'square-circle-theme-seasonal';
  
  readonly isDark = signal<boolean>(true);
  readonly seasonalTheme = signal<SeasonalTheme>('default');
  readonly currentTheme = computed(() => themes[this.seasonalTheme()]);
  
  readonly availableThemes = Object.values(themes);

  constructor() {
    // Load saved preferences
    const savedMode = localStorage.getItem(this.STORAGE_KEY_MODE);
    const savedSeasonal = localStorage.getItem(this.STORAGE_KEY_SEASONAL) as SeasonalTheme;
    
    const prefersDark = savedMode !== null ? savedMode === 'dark' : true;
    this.isDark.set(prefersDark);
    
    if (savedSeasonal && themes[savedSeasonal]) {
      this.seasonalTheme.set(savedSeasonal);
    }

    // Apply theme on changes
    effect(() => {
      const dark = this.isDark();
      const theme = this.seasonalTheme();
      this.applyTheme(dark, theme);
      localStorage.setItem(this.STORAGE_KEY_MODE, dark ? 'dark' : 'light');
      localStorage.setItem(this.STORAGE_KEY_SEASONAL, theme);
    });
  }

  toggle(): void {
    this.isDark.update(dark => !dark);
  }

  setDark(dark: boolean): void {
    this.isDark.set(dark);
  }

  setSeasonalTheme(theme: SeasonalTheme): void {
    this.seasonalTheme.set(theme);
  }

  private applyTheme(dark: boolean, seasonalTheme: SeasonalTheme): void {
    const body = document.body;
    const theme = themes[seasonalTheme];
    
    // Remove all seasonal theme classes
    Object.keys(themes).forEach(t => {
      body.classList.remove(`theme-${t}`);
    });
    
    // Add current seasonal theme class
    body.classList.add(`theme-${seasonalTheme}`);
    
    // When using a seasonal theme (not default), we don't need dark/light classes
    // because the theme defines all colors
    if (seasonalTheme === 'default') {
      // Apply dark/light mode for default theme
      if (dark) {
        body.classList.add('dark');
        body.classList.remove('light');
      } else {
        body.classList.add('light');
        body.classList.remove('dark');
      }
    } else {
      // Remove dark/light classes for seasonal themes
      body.classList.remove('dark', 'light');
    }
    
    // Apply CSS custom properties
    this.applyThemeColors(theme);
  }

  private applyThemeColors(theme: ThemeDefinition): void {
    const root = document.documentElement;
    
    root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', theme.colors.bgTertiary);
    root.style.setProperty('--bg-card', theme.colors.bgCard);
    root.style.setProperty('--bg-hover', theme.colors.bgHover);
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    root.style.setProperty('--border-color', theme.colors.borderColor);
    root.style.setProperty('--accent-primary', theme.colors.accentPrimary);
    root.style.setProperty('--accent-hover', theme.colors.accentHover);
    root.style.setProperty('--accent-glow', theme.colors.accentGlow);
    root.style.setProperty('--success', theme.colors.success);
    root.style.setProperty('--warning', theme.colors.warning);
    root.style.setProperty('--error', theme.colors.error);
    root.style.setProperty('--info', theme.colors.info);
    root.style.setProperty('--theme-gradient', theme.gradient);
  }
}
