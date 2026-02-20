import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player, PlayerForm } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private players: Player[] = [];
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private nextNumber = 1;

  // Track player encounters to avoid repetitions
  private playerEncounters: Map<string, Set<string>> = new Map();

  getPlayers$(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  getPlayers(): Player[] {
    return [...this.players];
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

    this.players.push(player);
    this.playerEncounters.set(player.id, new Set());
    this.playersSubject.next([...this.players]);
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

    this.players = [...this.players, ...newPlayers];
    newPlayers.forEach((p) => this.playerEncounters.set(p.id, new Set()));
    this.playersSubject.next([...this.players]);
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);
    this.playerEncounters.delete(playerId);
    this.playersSubject.next([...this.players]);
  }

  clearPlayers(): void {
    this.players = [];
    this.nextNumber = 1;
    this.playerEncounters.clear();
    this.playersSubject.next([]);
  }

  restorePlayers(players: Player[]): void {
    this.players = players.map((p, index) => ({
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

    this.playersSubject.next([...this.players]);
  }

  updatePlayerStats(playerId: string, won: boolean, teamScore: number): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.matchesPlayed++;
      if (won) {
        player.wins++;
      }
      // Accumulate team score directly (cumulative scoring)
      player.totalPoints += teamScore;
      this.playersSubject.next([...this.players]);
    }
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
    return [...this.players].sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
