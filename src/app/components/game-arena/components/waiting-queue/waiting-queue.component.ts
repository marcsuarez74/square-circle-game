import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../../../models/player.model';

@Component({
  selector: 'app-waiting-queue',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './waiting-queue.component.html',
  styleUrl: './waiting-queue.component.scss',
})
export class WaitingQueueComponent {
  players = input.required<Player[]>();
  getPlayerDisplayName = input.required<(player: Player) => string>();
}
