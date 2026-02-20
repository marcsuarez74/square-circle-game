import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlayerForm } from '../../../../models/player.model';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './player-form.component.html',
  styleUrl: './player-form.component.scss',
})
export class PlayerFormComponent {
  addPlayer = output<PlayerForm>();

  newPlayer: PlayerForm = {
    firstName: '',
    lastName: '',
  };

  get isValid(): boolean {
    return !!this.newPlayer.firstName && !!this.newPlayer.lastName;
  }

  onSubmit(): void {
    if (!this.isValid) return;

    this.addPlayer.emit({ ...this.newPlayer });

    // Reset form
    this.newPlayer = {
      firstName: '',
      lastName: '',
    };
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isValid) {
      this.onSubmit();
    }
  }
}
