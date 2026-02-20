import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-game-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
  ],
  templateUrl: './game-config.component.html',
  styleUrl: './game-config.component.scss',
})
export class GameConfigComponent {
  numberOfCourts = input.required<number>();
  matchDurationMinutes = input.required<number | null>();

  courtsChange = output<number>();
  durationChange = output<number | null>();

  timerPresets = [0.5, 3, 5, 10];
  courtOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  formatDuration(minutes: number): string {
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds} sec`;
    }
    return `${minutes} min`;
  }

  onCourtsChange(value: number): void {
    this.courtsChange.emit(value);
  }

  onDurationChange(value: number): void {
    this.durationChange.emit(value);
  }

  onCustomDurationChange(value: string): void {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      this.durationChange.emit(numValue);
    }
  }
}
