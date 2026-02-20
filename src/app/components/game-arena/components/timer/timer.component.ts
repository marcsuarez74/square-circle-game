import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent {
  remainingTime = input.required<number>();
  isRunning = input.required<boolean>();

  start = output<void>();
  stop = output<void>();

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getTimerClass(): string {
    if (!this.isRunning()) return '';
    if (this.remainingTime() <= 30) return 'danger';
    if (this.remainingTime() <= 60) return 'warning';
    return 'running';
  }
}
