import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Components
import { RankingPanel } from '../ranking-panel/ranking-panel';
import {
  CourtCardComponent,
  TimerComponent,
  ArenaControlsComponent,
  WaitingQueueComponent,
  type CourtScore,
} from './components';

// Services & Models
import { GameService } from '../../services/game';
import { PlayerService } from '../../services/player';
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
    MatTooltipModule,
    RankingPanel,
    CourtCardComponent,
    TimerComponent,
    ArenaControlsComponent,
    WaitingQueueComponent,
  ],
  templateUrl: './game-arena.html',
  styleUrl: './game-arena.scss',
})
export class GameArena implements OnInit, OnDestroy {
  private store = inject(GameStore);
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Store signals
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
    // Try to load saved game state first
    const hasSavedGame = this.store.loadFromStorage();
    
    // Check if we have an active game after loading
    const hasActiveGame = this.isGameActive();
    
    // If no game at all, redirect to setup
    if (!hasActiveGame) {
      this.router.navigate(['game-setup']);
      return;
    }

    // We have an active game - get current state
    const gameState = this.gameState();
    const players = this.players();
    
    if (hasSavedGame && gameState) {
      // Restore GameService state from storage
      this.gameService.restoreGameState(gameState);
      
      // Restore PlayerService players
      if (players.length > 0) {
        this.playerService.restorePlayers(players);
      }
      
      // Sync game service player references
      this.gameService.syncPlayerReferences();
      
      this.showMessage('Partie restaurée depuis la sauvegarde');
    }
    
    // Always initialize scores for any active game
    // This ensures courts have score entries even after refresh
    this.initializeScores();

    this.gameService.getState$().subscribe((state) => {
      const currentState = this.gameState();
      if (currentState) {
        this.store.setGameState({
          ...currentState,
          remainingTime: state.remainingTime,
          isTimerRunning: state.isTimerRunning,
        });
      }
    });

    this.saveInterval = setInterval(() => this.saveGame(), 10000);
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
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
      if (!this.matchScores()[court.id]) {
        this.store.updateScore(court.id, 'team1', 0);
        this.store.updateScore(court.id, 'team2', 0);
      }
    });
  }

  onScoreChange(event: { courtId: number; team: 'team1' | 'team2'; value: number }): void {
    this.store.updateScore(event.courtId, event.team, event.value);
  }

  nextRound(): void {
    this.saveMatchResults();
    this.gameService.nextRound(this.players());
    this.store.resetMatchScores();
    this.store.setGameState(this.gameService.getCurrentState());
    this.showMessage('Nouvelle manche !');
  }

  shufflePlayers(): void {
    this.gameService.shufflePlayers();
    this.store.setGameState(this.gameService.getCurrentState());
    this.showMessage('Joueurs mélangés !');
  }

  startRound(): void {
    this.gameService.startTimer();
    this.store.setGameState(this.gameService.getCurrentState());
  }

  stopRound(): void {
    this.gameService.stopTimer();
    this.store.setGameState(this.gameService.getCurrentState());
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
    this.isRankingPanelVisible.set(!this.isRankingPanelVisible());
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
        this.router.navigate(['game-setup']);
      }
    });
  }

  endGame(): void {
    // Sauvegarder les résultats finaux
    this.saveMatchResults();
    
    // Persister dans le localStorage avant redirection
    this.store.persistToStorage();
    
    // Afficher message de confirmation
    this.showMessage('Partie terminée ! Redirection vers le récapitulatif...');
    
    // Rediriger vers la page de terminaison
    this.router.navigate(['/terminate']);
  }

  protected showMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
