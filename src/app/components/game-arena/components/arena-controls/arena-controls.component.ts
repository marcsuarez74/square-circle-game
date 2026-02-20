import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-arena-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './arena-controls.component.html',
  styleUrl: './arena-controls.component.scss',
})
export class ArenaControlsComponent {
  isTimerRunning = input.required<boolean>();

  shuffle = output<void>();
  nextRound = output<void>();
  endGame = output<void>();
}
