import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../../../models/player.model';

@Component({
  selector: 'app-winner-card',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatIconModule],
  templateUrl: './winner-card.component.html',
  styleUrl: './winner-card.component.scss',
})
export class WinnerCardComponent {
  winner = input<Player | null>(null);
}
