import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';

// Services
import { PlayerService } from '../../services/player';
import { GameService } from '../../services/game';
import { GameStore } from '../../store/game.store';

// Models
import { PlayerForm } from '../../models/player.model';
import { GameState } from '../../models/game-state.model';

// Dumb Components
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import {
  FileImportComponent,
  FileImportEvent,
} from './components/file-import/file-import.component';
import { GameConfigComponent } from './components/game-config/game-config.component';
import { GameSummaryComponent } from './components/game-summary/game-summary.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    PlayerFormComponent,
    PlayerListComponent,
    FileImportComponent,
    GameConfigComponent,
    GameSummaryComponent,
    MatIcon,
  ],
  templateUrl: './game-setup.html',
  styleUrl: './game-setup.scss',
})
export class GameSetup {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  playerService = inject(PlayerService);
  private gameService = inject(GameService);
  private store = inject(GameStore);

  // Game configuration state
  numberOfCourts = 2;
  matchDurationMinutes: number | null = null;

  // Timer presets for formatting only
  timerPresets = [0.5, 3, 5, 10];

  // Imported game state
  private importedGameState: GameState | null = null;
  private importedMatchScores: { [courtId: number]: { team1: number; team2: number } } | null =
    null;

  // Player list from service (signal)
  players = computed(() => this.playerService.players());

  // ===== Event Handlers from Dumb Components =====

  onAddPlayer(playerForm: PlayerForm): void {
    this.playerService.addPlayer(playerForm);
    this.showMessage(`${playerForm.firstName} ${playerForm.lastName} ajouté !`);
  }

  onRemovePlayer(playerId: string): void {
    this.playerService.removePlayer(playerId);
  }

  onClearAllPlayers(): void {
    this.playerService.clearPlayers();
    this.showMessage('Tous les joueurs ont été supprimés');
  }

  onFileImported(event: FileImportEvent): void {
    if (event.type === 'excel') {
      this.importExcel(event.file);
    } else {
      this.importJson(event.file);
    }
  }

  onCourtsChange(value: number): void {
    this.numberOfCourts = value;
  }

  onDurationChange(value: number | null): void {
    this.matchDurationMinutes = value;
  }

  onStartGame(): void {
    const players = this.playerService.getPlayers();

    if (players.length < 2) {
      this.showMessage('Il faut au moins 2 joueurs pour commencer !');
      return;
    }

    if (!this.matchDurationMinutes || this.matchDurationMinutes <= 0) {
      this.showMessage('Veuillez définir une durée de match valide !');
      return;
    }

    if (this.importedGameState) {
      this.restoreImportedGame(players);
    } else {
      this.startNewGame(players);
    }
  }

  // ===== Private Methods =====

  private importExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const playersToAdd: PlayerForm[] = [];

        for (const row of jsonData) {
          const rowAny = row as any;
          const firstName =
            rowAny['prénom'] || rowAny['Prénom'] || rowAny['prenom'] || rowAny['Prenom'];
          const lastName = rowAny['nom'] || rowAny['Nom'];

          if (firstName && lastName) {
            playersToAdd.push({
              firstName: String(firstName).trim(),
              lastName: String(lastName).trim(),
            });
          }
        }

        if (playersToAdd.length > 0) {
          this.playerService.addPlayers(playersToAdd);
          this.showMessage(`${playersToAdd.length} joueurs importés avec succès !`);
        } else {
          this.showMessage(
            'Aucun joueur trouvé dans le fichier. Format attendu : colonnes "nom" et "prénom"',
          );
        }
      } catch (error) {
        this.showMessage("Erreur lors de l'import du fichier Excel");
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  private importJson(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);

        if (!jsonContent.gameState || !jsonContent.players) {
          this.showMessage('Fichier JSON invalide : structure incorrecte');
          return;
        }

        if (this.playerService.getPlayers().length > 0) {
          if (!confirm('Cela remplacera les joueurs actuels. Continuer ?')) {
            return;
          }
        }

        this.playerService.clearPlayers();
        if (jsonContent.players && jsonContent.players.length > 0) {
          this.playerService.restorePlayers(jsonContent.players);
        }

        if (jsonContent.gameState) {
          this.numberOfCourts = jsonContent.gameState.courts?.length || 2;
        }

        if (jsonContent.gameState?.remainingTime) {
          this.matchDurationMinutes = Math.ceil(jsonContent.gameState.remainingTime / 60);
        }

        if (jsonContent.gameState) {
          this.importedGameState = jsonContent.gameState as GameState;
        }
        if (jsonContent.matchScores) {
          this.importedMatchScores = jsonContent.matchScores;
        }

        this.showMessage(
          `Partie chargée : ${jsonContent.players?.length || 0} joueurs, manche ${jsonContent.gameState?.currentSet || 1}`,
        );
      } catch (error) {
        this.showMessage("Erreur lors de l'import du fichier JSON");
        console.error(error);
      }
    };

    reader.readAsText(file);
  }

  private restoreImportedGame(players: any[]): void {
    this.gameService.restoreGameState(this.importedGameState!);
    this.gameService.syncPlayerReferences();
    this.store.setGameState(this.gameService.getCurrentState());
    this.store.setPlayers(players);
    this.store.resetMatchScores();

    this.importedGameState = null;
    this.importedMatchScores = null;

    this.showMessage('Partie restaurée ! Les scores commencent à 0.');
    this.router.navigate(['/game']);
  }

  private startNewGame(players: any[]): void {
    // Réinitialiser complètement pour une nouvelle partie
    this.store.resetMatchScores();

    this.gameService.setConfig({
      numberOfCourts: this.numberOfCourts,
      matchDuration: this.matchDurationMinutes! * 60,
    });

    this.gameService.assignPlayersToCourts(players);

    const gameState = this.gameService.getCurrentState();
    this.store.setGameState(gameState);
    this.store.setPlayers(players);

    // Sauvegarder immédiatement la nouvelle partie
    this.store.persistToStorage();

    this.router.navigate(['/game']);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
