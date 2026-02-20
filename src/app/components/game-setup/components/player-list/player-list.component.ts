import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Player } from '../../../../models/player.model';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent {
  players = input.required<Player[]>();

  removePlayer = output<string>();
  clearAll = output<void>();

  onRemovePlayer(playerId: string): void {
    this.removePlayer.emit(playerId);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }
}
