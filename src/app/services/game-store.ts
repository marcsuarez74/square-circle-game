import { Injectable, signal, effect } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { Player } from '../models/player.model';

export interface PersistedGameState {
  version: number;
  timestamp: number;
  gameState: GameState;
  players: Player[];
  matchScores: { [courtId: number]: { team1: number; team2: number } };
}

@Injectable({
  providedIn: 'root'
})
export class GameStore {
  private readonly STORAGE_KEY = 'square-circle-game-state';
  private readonly VERSION = 1;
  
  // Signals for reactive state
  readonly hasSavedGame = signal<boolean>(false);
  readonly lastSavedAt = signal<Date | null>(null);
  
  constructor() {
    // Check if there's a saved game on init
    this.checkForSavedGame();
  }
  
  private checkForSavedGame(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.hasSavedGame.set(!!saved);
    if (saved) {
      const data: PersistedGameState = JSON.parse(saved);
      this.lastSavedAt.set(new Date(data.timestamp));
    }
  }
  
  /**
   * Save the complete game state to localStorage
   */
  saveGame(gameState: GameState, players: Player[], matchScores: { [courtId: number]: { team1: number; team2: number } }): void {
    const data: PersistedGameState = {
      version: this.VERSION,
      timestamp: Date.now(),
      gameState,
      players,
      matchScores
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.hasSavedGame.set(true);
    this.lastSavedAt.set(new Date());
  }
  
  /**
   * Load the saved game state from localStorage
   */
  loadGame(): PersistedGameState | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return null;
    
    try {
      const data: PersistedGameState = JSON.parse(saved);
      
      // Version check for migrations if needed in future
      if (data.version !== this.VERSION) {
        console.warn(`Game state version mismatch: ${data.version} vs ${this.VERSION}`);
        // Could add migration logic here
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load game state:', error);
      this.clearSavedGame();
      return null;
    }
  }
  
  /**
   * Clear the saved game state
   */
  clearSavedGame(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.hasSavedGame.set(false);
    this.lastSavedAt.set(null);
  }
  
  /**
   * Export game as JSON file
   */
  exportGame(gameState: GameState, players: Player[], matchScores: { [courtId: number]: { team1: number; team2: number } }): void {
    const exportData = {
      exportDate: new Date().toISOString(),
      gameState,
      players: players.map(p => ({
        ...p,
        displayName: `${p.firstName} ${p.lastName}`
      })),
      matchScores,
      summary: {
        totalPlayers: players.length,
        totalCourts: gameState.courts.length,
        currentRound: gameState.currentSet,
        timerRunning: gameState.isTimerRunning,
        remainingTime: gameState.remainingTime
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ronde-des-carres-manche-${gameState.currentSet}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Check if there's a game in progress that can be resumed
   */
  canResumeGame(): boolean {
    const saved = this.loadGame();
    if (!saved) return false;
    
    // Check if the game isn't too old (e.g., older than 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms
    const age = Date.now() - saved.timestamp;
    
    if (age > maxAge) {
      this.clearSavedGame();
      return false;
    }
    
    return true;
  }
}
