import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Court } from '../../../../models/court.model';
import { Player } from '../../../../models/player.model';

export interface CourtScore {
  team1: number;
  team2: number;
}

@Component({
  selector: 'app-court-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './court-card.component.html',
  styleUrl: './court-card.component.scss',
})
export class CourtCardComponent {
  court = input.required<Court>();
  score = input.required<CourtScore>();
  getPlayerDisplayName = input.required<(player: Player) => string>();

  scoreChange = output<{ courtId: number; team: 'team1' | 'team2'; value: number }>();

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

  onScoreChange(team: 'team1' | 'team2', value: string): void {
    const numValue = parseInt(value, 10) || 0;
    this.scoreChange.emit({
      courtId: this.court().id,
      team,
      value: Math.max(0, numValue),
    });
  }
}
