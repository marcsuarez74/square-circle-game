import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme';
import { SeasonalTheme } from './services/theme-definitions';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatIconModule]
})
export class App {
  protected readonly title = 'square-circle-game';
  themeService = inject(ThemeService);
  
  isThemeSelectorOpen = signal<boolean>(false);

  toggleThemeSelector(): void {
    this.isThemeSelectorOpen.update(open => !open);
  }

  selectTheme(themeId: SeasonalTheme): void {
    this.themeService.setSeasonalTheme(themeId);
    this.isThemeSelectorOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.seasonal-theme-selector')) {
      this.isThemeSelectorOpen.set(false);
    }
  }
}
