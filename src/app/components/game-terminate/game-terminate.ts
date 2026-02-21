import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStore } from '../../store/game.store';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Dumb Components
import {
  GameStatsComponent,
  WinnerCardComponent,
  RankingsListComponent,
  ActionButtonsComponent,
  ThankYouComponent,
} from './components';

@Component({
  selector: 'app-game-terminate',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    GameStatsComponent,
    WinnerCardComponent,
    RankingsListComponent,
    ActionButtonsComponent,
    ThankYouComponent,
  ],
  templateUrl: './game-terminate.html',
  styleUrl: './game-terminate.scss',
})
export class GameTerminate {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private store = inject(GameStore);

  // Signals from store
  protected gameState = this.store.gameState;
  protected players = this.store.players;
  protected currentSet = this.store.currentSet;

  // Computed values
  protected rankings = computed(() => {
    return [...this.players()].sort((a, b) => b.totalPoints - a.totalPoints);
  });

  protected totalCourts = computed(() => this.gameState()?.courts?.length || 0);
  protected totalPlayers = computed(() => this.players().length);
  protected winningTeam = computed(() => {
    const rankings = this.rankings();
    return rankings.length > 0 ? rankings[0] : null;
  });

  constructor() {
    // Redirect if no game data
    effect(() => {
      if (!this.gameState()) {
        this.router.navigate(['/game-setup']);
      }
    });
  }

  // ===== Event Handlers =====

  onDeleteGame(): void {
    if (
      confirm('Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible.')
    ) {
      this.store.clearStorage();
      this.showMessage('Partie supprimée avec succès');
      this.router.navigate(['/game-setup']);
    }
  }

  onExportPdf(): void {
    const doc = new jsPDF();
    const state = this.gameState();
    const players = this.players();
    const rankings = this.rankings();

    if (!state || !players.length) {
      this.showMessage('Aucune donnée à exporter');
      return;
    }

    // Generate PDF
    this.generatePDF(doc, state, rankings);
    this.showMessage('PDF exporté avec succès');
  }

  onBackToSetup(): void {
    this.router.navigate(['/game-setup']);
  }

  onNewGame(): void {
    // Garder les joueurs mais réinitialiser tout le reste
    const currentPlayers = this.players();

    // Reset le store (garde les joueurs, reset le gameState et les scores)
    this.store.setGameState(null as any);
    this.store.resetMatchScores();

    // Pour chaque joueur, reset leurs stats
    const resetPlayers = currentPlayers.map((player) => ({
      ...player,
      totalPoints: 0,
      matchesPlayed: 0,
      wins: 0,
    }));

    this.store.setPlayers(resetPlayers);

    // Sauvegarder le nouvel état (joueurs reset mais présents)
    this.store.persistToStorage();

    this.showMessage('Nouvelle partie prête ! Les joueurs sont conservés.');
    this.router.navigate(['/game-setup']);
  }

  // ===== Private Methods =====

  private generatePDF(doc: jsPDF, state: any, rankings: any[]): void {
    doc.setFontSize(24);
    doc.text('Ronde des Carrés - Récapitulatif', 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Informations de la partie', 14, 45);

    doc.setFontSize(11);
    doc.text(`• Nombre de manches: ${state.currentSet}`, 14, 55);
    doc.text(`• Nombre de joueurs: ${rankings.length}`, 14, 62);
    doc.text(`• Nombre de terrains: ${state.courts.length}`, 14, 69);
    doc.text(`• Temps restant: ${this.formatTime(state.remainingTime)}`, 14, 76);

    doc.setFontSize(14);
    doc.text('Classement final', 14, 95);

    const tableData = rankings.map((player, index) => [
      `${index + 1}`,
      `${player.firstName} ${player.lastName}`,
      player.totalPoints.toString(),
      player.matchesPlayed.toString(),
      player.wins.toString(),
    ]);

    autoTable(doc, {
      head: [['#', 'Joueur', 'Points', 'Matchs', 'Victoires']],
      body: tableData,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [56, 189, 248] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text('Merci à tous les joueurs pour leur participation !', 14, finalY);
    doc.setFontSize(10);
    doc.text('Ronde des Carrés - Badminton', 14, finalY + 10);

    doc.save(`ronde-des-carres-recapitulatif-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
