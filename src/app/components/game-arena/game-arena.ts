import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule, AsyncPipe } from '@angular/common';
import { GameService } from '../../services/game';
import { PlayerService } from '../../services/player';
import { Court } from '../../models/court.model';
import { Player } from '../../models/player.model';

interface GameState {
  courts: Court[];
  waitingQueue: Player[];
  isTimerRunning: boolean;
  remainingTime: number;
  currentSet: number;
}

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
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './game-arena.html',
  styleUrl: './game-arena.scss',
})
export class GameArena implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  gameState: GameState | null = null;
  private subscription: Subscription | null = null;

  matchScores: { [courtId: number]: { team1: number; team2: number } } = {};

  ngOnInit(): void {
    this.subscription = this.gameService.getState$().subscribe((state) => {
      this.gameState = state;
      this.initializeScores();
    });

    if (!this.gameService.getCurrentState().courts.length) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initializeScores(): void {
    if (this.gameState) {
      this.gameState.courts.forEach((court) => {
        if (!this.matchScores[court.id]) {
          this.matchScores[court.id] = { team1: 0, team2: 0 };
        }
      });
    }
  }

  startRound(): void {
    if (this.gameState?.isTimerRunning) return;

    this.gameService.startTimer();
    this.showMessage('Manche lancée !');
  }

  stopRound(): void {
    this.gameService.stopTimer();
  }

  shufflePlayers(): void {
    this.gameService.shufflePlayers();
    this.showMessage('Joueurs mélangés !');
  }

  nextRound(): void {
    this.saveMatchResults();
    this.gameService.nextRound();
    this.matchScores = {};
    this.showMessage('Nouvelle manche !');
  }

  private saveMatchResults(): void {
    if (!this.gameState) return;

    this.gameState.courts.forEach((court) => {
      if (court.players.length === 4) {
        const score = this.matchScores[court.id] || { team1: 0, team2: 0 };
        const team1Won = score.team1 > score.team2;

        court.players.forEach((player, index) => {
          const isTeam1 = index < 2;
          const won = isTeam1 ? team1Won : !team1Won;
          const scoreDiff = isTeam1 
            ? score.team1 - score.team2 
            : score.team2 - score.team1;

          this.playerService.updatePlayerStats(
            player.id,
            won,
            Math.max(0, scoreDiff)
          );
        });
      }
    });
  }

  formatTime(seconds: number): string {
    return this.gameService.formatTime(seconds);
  }

  getTeams(court: Court): { team1: Player[]; team2: Player[] } {
    if (court.players.length === 4) {
      return {
        team1: [court.players[0], court.players[1]],
        team2: [court.players[2], court.players[3]],
      };
    }
    return { team1: court.players, team2: [] };
  }

  updateScore(courtId: number, team: 'team1' | 'team2', value: number): void {
    if (!this.matchScores[courtId]) {
      this.matchScores[courtId] = { team1: 0, team2: 0 };
    }
    this.matchScores[courtId][team] = Math.max(0, value);
  }

  endGame(): void {
    this.gameService.stopTimer();
    const players = this.playerService.getPlayers();
    
    const rankings = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log('Classement final:', rankings);
    this.showMessage('Partie terminée ! Consultez la console pour le classement.');
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
