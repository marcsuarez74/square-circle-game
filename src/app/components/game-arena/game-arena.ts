import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { RankingPanel } from '../ranking-panel/ranking-panel';
import { GameService } from '../../services/game';
import { GameStore } from '../../store/game.store';
import { GameState } from '../../models/game-state.model';
import { Court } from '../../models/court.model';
import { Player } from '../../models/player.model';
import { ConfirmDialog, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-game-arena',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatTooltipModule,
    RankingPanel,
  ],
  templateUrl: './game-arena.html',
  styleUrl: './game-arena.scss',
})
export class GameArena implements OnInit, OnDestroy {
  private store = inject(GameStore);
  private gameService = inject(GameService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Expose store signals
  protected gameState = this.store.gameState;
  protected players = this.store.players;
  protected matchScores = this.store.matchScores;
  protected isTimerRunning = this.store.isTimerRunning;
  protected remainingTime = this.store.remainingTime;
  protected currentSet = this.store.currentSet;
  protected waitingPlayers = this.store.waitingPlayers;
  protected isGameActive = this.store.isGameActive;

  isRankingPanelVisible = signal(false);
  private saveInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // Navigate back if no game is active
    if (!this.isGameActive()) {
      this.router.navigate(['/']);
      return;
    }

    // Initialize scores for courts
    this.initializeScores();

    // Auto-save every 10 seconds
    this.saveInterval = setInterval(() => {
      this.saveGame();
    }, 10000);

    // Save on page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Save one last time
    this.saveGame();
  }

  private handleBeforeUnload(): void {
    this.saveGame();
  }

  private saveGame(): void {
    this.store.persistToStorage();
  }

  initializeScores(): void {
    const state = this.gameState();
    if (!state) return;

    state.courts.forEach((court) => {
      const scores = this.matchScores();
      if (!scores[court.id]) {
        this.store.updateScore(court.id, 'team1', 0);
        this.store.updateScore(court.id, 'team2', 0);
      }
    });
  }

  getTeams(court: Court): { team1: Player[]; team2: Player[] } {
    if (court.players.length === 4) {
      return {
        team1: [court.players[0], court.players[1]],
        team2: [court.players[2], court.players[3]],
      };
    } else if (court.players.length === 2) {
      return {
        team1: [court.players[0]],
        team2: [court.players[1]],
      };
    }
    return { team1: court.players, team2: [] };
  }

  onScoreInput(courtId: number, team: 'team1' | 'team2', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10) || 0;
    this.updateScore(courtId, team, value);
  }

  updateScore(courtId: number, team: 'team1' | 'team2', value: number): void {
    this.store.updateScore(courtId, team, Math.max(0, value));
  }

  nextRound(): void {
    this.saveMatchResults();
    // Pass updated players with fresh matchesPlayed data
    this.gameService.nextRound(this.players());
    this.store.resetMatchScores();
    // Sync game state from service to store
    this.store.setGameState(this.gameService.getCurrentState());
    this.showMessage('Nouvelle manche !');
  }

  shufflePlayers(): void {
    this.gameService.shufflePlayers();
    // Sync game state from service to store
    this.store.setGameState(this.gameService.getCurrentState());
    this.showMessage('Joueurs mélangés !');
  }

  startRound(): void {
    this.gameService.startTimer();
    // Sync game state from service to store
    this.store.setGameState(this.gameService.getCurrentState());
  }

  stopRound(): void {
    this.gameService.stopTimer();
    // Sync game state from service to store
    this.store.setGameState(this.gameService.getCurrentState());
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private saveMatchResults(): void {
    const state = this.gameState();
    if (!state) return;

    const scores = this.matchScores();

    state.courts.forEach((court) => {
      if (court.players.length === 4 || court.players.length === 2) {
        const score = scores[court.id] || { team1: 0, team2: 0 };
        const team1Won = score.team1 > score.team2;

        court.players.forEach((player, index) => {
          let isTeam1: boolean;
          if (court.players.length === 4) {
            isTeam1 = index < 2;
          } else {
            isTeam1 = index === 0;
          }
          const won = isTeam1 ? team1Won : !team1Won;
          const teamScore = isTeam1 ? score.team1 : score.team2;

          this.store.updatePlayerStats(player.id, won, teamScore);
        });
      }
    });
  }

  hasDuplicateFirstName(firstName: string, playerId: string): boolean {
    const state = this.gameState();
    if (!state) return false;

    const allPlayers = [...state.courts.flatMap((c) => c.players), ...state.waitingQueue];

    return allPlayers.some(
      (p) => p.id !== playerId && p.firstName.toLowerCase() === firstName.toLowerCase(),
    );
  }

  getPlayerDisplayName(player: Player): string {
    if (this.hasDuplicateFirstName(player.firstName, player.id)) {
      const lastNameInitial = player.lastName.charAt(0).toUpperCase();
      return `${player.firstName} ${lastNameInitial}.`;
    }
    return player.firstName;
  }

  toggleRankingPanel(): void {
    this.isRankingPanelVisible.update((visible) => !visible);
  }

  hideRankingPanel(): void {
    this.isRankingPanelVisible.set(false);
  }

  backToSetup(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Quitter la partie ?',
      message: 'Vous allez quitter la partie en cours. Toute progression sera perdue.',
      confirmText: 'Quitter',
      cancelText: 'Annuler',
      type: 'warning',
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.store.clearStorage();
        this.router.navigate(['/']);
      }
    });
  }

  endGame(): void {
    // Save final results to store
    this.saveMatchResults();

    // Persist to localStorage before export
    this.store.persistToStorage();

    // Export final results (will read from localStorage)
    this.store.exportToJSON();

    const allPlayers = this.players();
    const rankings = [...allPlayers].sort((a, b) => b.totalPoints - a.totalPoints);

    console.log('Classement final:', rankings);
    this.showMessage('Partie terminée ! Résultats exportés.');

    // Clear saved game after export
    this.store.clearStorage();

    // Navigate back to setup after a delay
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }

  protected showMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
