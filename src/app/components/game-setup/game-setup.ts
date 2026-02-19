import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from 'xlsx';
import { PlayerService } from '../../services/player';
import { GameService } from '../../services/game';
import { PlayerForm } from '../../models/player.model';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './game-setup.html',
  styleUrl: './game-setup.scss',
})
export class GameSetup {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  playerService = inject(PlayerService);
  private gameService = inject(GameService);

  // Player form
  newPlayer: PlayerForm = {
    firstName: '',
    lastName: '',
    level: undefined,
  };

  // Game configuration
  numberOfCourts = 2;
  matchDurationMinutes: number | null = null;

  // File upload
  selectedFile: File | null = null;
  isDragging = false;

  // Timer presets
  timerPresets = [10, 15, 20, 25, 30];

  get isFormValid(): boolean {
    const players = this.playerService.getPlayers();
    return players.length >= 2 && !!this.matchDurationMinutes && this.matchDurationMinutes > 0;
  }

  getValidationStatus(): { valid: boolean; message: string } {
    const players = this.playerService.getPlayers();
    
    if (players.length < 2) {
      return { valid: false, message: `Il manque ${2 - players.length} joueur(s)` };
    }
    
    if (!this.matchDurationMinutes || this.matchDurationMinutes <= 0) {
      return { valid: false, message: 'Définissez une durée de match' };
    }
    
    return { valid: true, message: 'Prêt à lancer !' };
  }

  selectTimer(minutes: number): void {
    this.matchDurationMinutes = minutes;
  }

  addPlayer(): void {
    if (!this.newPlayer.firstName || !this.newPlayer.lastName) {
      this.showMessage('Veuillez remplir le prénom et le nom');
      return;
    }

    this.playerService.addPlayer({ ...this.newPlayer });
    this.showMessage(`${this.newPlayer.firstName} ${this.newPlayer.lastName} ajouté !`);

    this.newPlayer = {
      firstName: '',
      lastName: '',
      level: undefined,
    };
  }

  removePlayer(playerId: string): void {
    this.playerService.removePlayer(playerId);
  }

  clearAllPlayers(): void {
    this.playerService.clearPlayers();
    this.showMessage('Tous les joueurs ont été supprimés');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.importExcel();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile = file;
        this.importExcel();
      } else {
        this.showMessage('Veuillez déposer un fichier Excel (.xlsx ou .xls)');
      }
    }
  }

  importExcel(): void {
    if (!this.selectedFile) return;

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
          const firstName = rowAny['prénom'] || rowAny['Prénom'] || rowAny['prenom'] || rowAny['Prenom'];
          const lastName = rowAny['nom'] || rowAny['Nom'];
          const level = rowAny['niveau'] || rowAny['Niveau'] || rowAny['level'];

          if (firstName && lastName) {
            playersToAdd.push({
              firstName: String(firstName).trim(),
              lastName: String(lastName).trim(),
              level: level ? Number(level) : undefined,
            });
          }
        }

        if (playersToAdd.length > 0) {
          this.playerService.addPlayers(playersToAdd);
          this.showMessage(`${playersToAdd.length} joueurs importés avec succès !`);
        } else {
          this.showMessage('Aucun joueur trouvé dans le fichier. Format attendu : colonnes "nom" et "prénom"');
        }

        this.selectedFile = null;
      } catch (error) {
        this.showMessage('Erreur lors de l\'import du fichier Excel');
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  startGame(): void {
    const players = this.playerService.getPlayers();
    
    if (players.length < 2) {
      this.showMessage('Il faut au moins 2 joueurs pour commencer !');
      return;
    }

    if (!this.matchDurationMinutes || this.matchDurationMinutes <= 0) {
      this.showMessage('Veuillez définir une durée de match valide !');
      return;
    }

    this.gameService.setConfig({
      numberOfCourts: this.numberOfCourts,
      matchDuration: this.matchDurationMinutes * 60,
    });

    this.gameService.assignPlayersToCourts(players);
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
