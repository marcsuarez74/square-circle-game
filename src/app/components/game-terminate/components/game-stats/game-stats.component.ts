import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './game-stats.component.html',
  styleUrl: './game-stats.component.scss',
})
export class GameStatsComponent {
  currentSet = input.required<number>();
  totalPlayers = input.required<number>();
  totalCourts = input.required<number>();
}
