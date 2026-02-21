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

@Component({
  selector: 'app-game-terminate',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './game-terminate.html',
  styleUrl: './game-terminate.scss',
})
export class GameTerminate {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private store = inject(GameStore);

  // Signals from store
  gameState = this.store.gameState;
  players = this.store.players;
  matchScores = this.store.matchScores;
  currentSet = this.store.currentSet;

  // Computed values
  rankings = computed(() => {
    const allPlayers = this.players();
    return [...allPlayers].sort((a, b) => b.totalPoints - a.totalPoints);
  });

  totalCourts = computed(() => this.gameState()?.courts?.length || 0);
  totalPlayers = computed(() => this.players()?.length || 0);
  totalMatches = computed(() => {
    const state = this.gameState();
    if (!state) return 0;
    return state.courts.reduce((acc, court) => acc + court.players.reduce((pAcc, p) => pAcc + p.matchesPlayed, 0), 0) / 4;
  });

  winningTeam = computed(() => {
    const rankings = this.rankings();
    if (rankings.length === 0) return null;
    return rankings[0];
  });

  constructor() {
    // Redirect if no game data
    effect(() => {
      if (!this.gameState()) {
        this.router.navigate(['/game-setup']);
      }
    });
  }

  deleteGame(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible.')) {
      this.store.clearStorage();
      this.showMessage('Partie supprimée avec succès');
      this.router.navigate(['/game-setup']);
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const state = this.gameState();
    const players = this.players();
    const rankings = this.rankings();

    if (!state || !players.length) {
      this.showMessage('Aucune donnée à exporter');
      return;
    }

    // Title
    doc.setFontSize(24);
    doc.text('Ronde des Carrés - Récapitulatif', 14, 20);

    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    // Game Info
    doc.setFontSize(14);
    doc.text('Informations de la partie', 14, 45);
    
    doc.setFontSize(11);
    doc.text(`• Nombre de manches: ${state.currentSet}`, 14, 55);
    doc.text(`• Nombre de joueurs: ${players.length}`, 14, 62);
    doc.text(`• Nombre de terrains: ${state.courts.length}`, 14, 69);
    doc.text(`• Temps restant: ${this.formatTime(state.remainingTime)}`, 14, 76);

    // Rankings Table
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

    // Thank you message
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text('Merci à tous les joueurs pour leur participation !', 14, finalY);
    doc.setFontSize(10);
    doc.text('Ronde des Carrés - Badminton', 14, finalY + 10);

    // Save PDF
    doc.save(`ronde-des-carres-recapitulatif-${new Date().toISOString().split('T')[0]}.pdf`);
    this.showMessage('PDF exporté avec succès');
  }

  backToSetup(): void {
    this.router.navigate(['/game-setup']);
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
