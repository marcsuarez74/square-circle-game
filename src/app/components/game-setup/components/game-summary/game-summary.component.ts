import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../../../models/player.model';

export interface ValidationStatus {
  valid: boolean;
  message: string;
}

@Component({
  selector: 'app-game-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './game-summary.component.html',
  styleUrl: './game-summary.component.scss',
})
export class GameSummaryComponent {
  players = input.required<Player[]>();
  numberOfCourts = input.required<number>();
  matchDurationMinutes = input.required<number | null>();

  startGame = output<void>();

  validationStatus = computed<ValidationStatus>(() => {
    const playerCount = this.players().length;

    if (playerCount < 2) {
      return { valid: false, message: `Il manque ${2 - playerCount} joueur(s)` };
    }

    if (!this.matchDurationMinutes() || this.matchDurationMinutes()! <= 0) {
      return { valid: false, message: 'Définissez une durée de match' };
    }

    return { valid: true, message: 'Prêt à lancer !' };
  });

  isFormValid = computed(() => this.validationStatus().valid);

  waitingPlayersCount = computed(() => {
    const playerCount = this.players().length;
    const maxPlayers = this.numberOfCourts() * 4;
    return Math.max(0, playerCount - maxPlayers);
  });

  playersPerCourt = computed(() => {
    return this.players().length / this.numberOfCourts();
  });

  onStartGame(): void {
    this.startGame.emit();
  }
}
