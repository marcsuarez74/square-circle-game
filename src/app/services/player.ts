import { Injectable, signal, computed } from '@angular/core';
import { Player, PlayerForm } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private playersSignal = signal<Player[]>([]);
  readonly players = computed(() => this.playersSignal());
  private nextNumber = 1;

  // Track player encounters to avoid repetitions
  private playerEncounters: Map<string, Set<string>> = new Map();

  getPlayers(): Player[] {
    return this.playersSignal();
  }

  addPlayer(playerForm: PlayerForm): Player {
    const player: Player = {
      id: this.generateId(),
      number: this.nextNumber++,
      firstName: playerForm.firstName,
      lastName: playerForm.lastName,
      totalPoints: 0,
      matchesPlayed: 0,
      wins: 0,
    };

    this.playerEncounters.set(player.id, new Set());
    this.playersSignal.update((players) => [...players, player]);
    return player;
  }

  addPlayers(playersForm: PlayerForm[]): void {
    const newPlayers = playersForm.map((form) => ({
      id: this.generateId(),
      number: this.nextNumber++,
      firstName: form.firstName,
      lastName: form.lastName,
      totalPoints: 0,
      matchesPlayed: 0,
      wins: 0,
    }));

    newPlayers.forEach((p) => this.playerEncounters.set(p.id, new Set()));
    this.playersSignal.update((players) => [...players, ...newPlayers]);
  }

  removePlayer(playerId: string): void {
    this.playerEncounters.delete(playerId);
    this.playersSignal.update((players) => players.filter((p) => p.id !== playerId));
  }

  clearPlayers(): void {
    this.nextNumber = 1;
    this.playerEncounters.clear();
    this.playersSignal.set([]);
  }

  restorePlayers(players: Player[]): void {
    const restoredPlayers = players.map((p, index) => ({
      ...p,
      number: index + 1,
    }));
    this.nextNumber = players.length + 1;

    // Restore encounters map
    players.forEach((p) => {
      if (!this.playerEncounters.has(p.id)) {
        this.playerEncounters.set(p.id, new Set());
      }
    });

    this.playersSignal.set(restoredPlayers);
  }

  updatePlayerStats(playerId: string, won: boolean, teamScore: number): void {
    this.playersSignal.update((players) => {
      return players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            matchesPlayed: player.matchesPlayed + 1,
            wins: won ? player.wins + 1 : player.wins,
            totalPoints: player.totalPoints + teamScore,
          };
        }
        return player;
      });
    });
  }

  // Track that two players have played together
  recordEncounter(playerId1: string, playerId2: string): void {
    if (!this.playerEncounters.has(playerId1)) {
      this.playerEncounters.set(playerId1, new Set());
    }
    if (!this.playerEncounters.has(playerId2)) {
      this.playerEncounters.set(playerId2, new Set());
    }
    this.playerEncounters.get(playerId1)?.add(playerId2);
    this.playerEncounters.get(playerId2)?.add(playerId1);
  }

  // Check if two players have already played together
  havePlayedTogether(playerId1: string, playerId2: string): boolean {
    return this.playerEncounters.get(playerId1)?.has(playerId2) || false;
  }

  // Get all encounters for a player
  getPlayerEncounters(playerId: string): Set<string> {
    return this.playerEncounters.get(playerId) || new Set();
  }

  getRankings(): Player[] {
    return [...this.playersSignal()].sort((a, b) => b.totalPoints - a.totalPoints);
  }

  getPlayerById(playerId: string): Player | undefined {
    return this.playersSignal().find((p) => p.id === playerId);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
