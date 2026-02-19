import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'square-circle-theme';
  readonly isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = saved !== null ? saved === 'dark' : true;
    this.isDark.set(prefersDark);
    this.applyTheme(prefersDark);

    effect(() => {
      const dark = this.isDark();
      this.applyTheme(dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(dark => !dark);
  }

  setDark(dark: boolean): void {
    this.isDark.set(dark);
  }

  private applyTheme(dark: boolean): void {
    const body = document.body;
    if (dark) {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }
}
