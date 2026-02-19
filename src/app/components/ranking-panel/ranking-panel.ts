import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Player } from '../../models/player.model';
import { GameStore } from '../../store/game.store';

@Component({
  selector: 'app-ranking-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './ranking-panel.html',
  styleUrl: './ranking-panel.scss',
})
export class RankingPanel {
  protected store = inject(GameStore);

  @Input() isVisible = false;

  @Output() close = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  // Computed sorted players with cumulative match scores
  protected sortedPlayersWithCurrentScores = computed(() => {
    const players = this.store.players();
    const gameState = this.store.gameState();
    const matchScores = this.store.matchScores();

    if (!players.length) return [];

    // Calculate cumulative points for each player (sum of all match scores)
    const playersWithCumulativeScores = players.map((player) => {
      let currentMatchPoints = 0;

      if (gameState) {
        for (const court of gameState.courts) {
          const playerIndex = court.players.findIndex((p) => p.id === player.id);
          if (playerIndex !== -1) {
            const score = matchScores[court.id] || { team1: 0, team2: 0 };

            let isTeam1: boolean;
            if (court.players.length === 4) {
              isTeam1 = playerIndex < 2;
            } else {
              isTeam1 = playerIndex === 0;
            }

            // Points = score de l'équipe (teamScore)
            currentMatchPoints = isTeam1 ? score.team1 : score.team2;
            break;
          }
        }
      }

      // Total = points cumulés des matchs précédents + points du match actuel
      return {
        ...player,
        currentMatchPoints,
        displayTotal: player.totalPoints + currentMatchPoints,
      };
    });

    // Classement par total de points marqués (displayTotal)
    return playersWithCumulativeScores.sort((a, b) => b.displayTotal - a.displayTotal);
  });

  getPlayerDisplayName(player: Player & { currentMatchPoints?: number }): string {
    const players = this.store.players();

    // Check for duplicate first names
    const duplicates = players.filter(
      (p) => p.id !== player.id && p.firstName.toLowerCase() === player.firstName.toLowerCase(),
    );

    if (duplicates.length > 0) {
      const lastNameInitial = player.lastName.charAt(0).toUpperCase();
      return `${player.firstName} ${lastNameInitial}.`;
    }
    return player.firstName;
  }

  getPlayerTotalPoints(player: Player & { currentMatchPoints?: number }): number {
    return player.totalPoints + (player.currentMatchPoints || 0);
  }

  onClose(): void {
    this.close.emit();
  }

  onExport(): void {
    this.store.exportToJSON();
    this.export.emit();
  }
}
