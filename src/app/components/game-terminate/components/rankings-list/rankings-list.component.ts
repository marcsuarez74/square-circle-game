import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../../../models/player.model';

@Component({
  selector: 'app-rankings-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './rankings-list.component.html',
  styleUrl: './rankings-list.component.scss',
})
export class RankingsListComponent {
  rankings = input.required<Player[]>();
}
