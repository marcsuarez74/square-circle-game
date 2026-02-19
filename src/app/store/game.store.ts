import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { GameState } from '../models/game-state.model';
import { Player } from '../models/player.model';
import { Court } from '../models/court.model';

export interface GameStoreState {
  gameState: GameState | null;
  players: Player[];
  matchScores: { [courtId: number]: { team1: number; team2: number } };
  isLoading: boolean;
  error: string | null;
}

const initialState: GameStoreState = {
  gameState: null,
  players: [],
  matchScores: {},
  isLoading: false,
  error: null,
};

export const GameStore = signalStore(
  withState(initialState),
  
  withComputed((store) => ({
    // Computed: sorted players by total points
    sortedPlayers: computed(() => {
      const players = store.players();
      return [...players].sort((a, b) => b.totalPoints - a.totalPoints);
    }),
    
    // Computed: current game is active
    isGameActive: computed(() => !!store.gameState()?.courts.length),
    
    // Computed: total number of courts
    courtCount: computed(() => store.gameState()?.courts.length ?? 0),
    
    // Computed: players in waiting queue
    waitingPlayers: computed(() => store.gameState()?.waitingQueue ?? []),
    
    // Computed: current round/set
    currentSet: computed(() => store.gameState()?.currentSet ?? 1),
    
    // Computed: is timer running
    isTimerRunning: computed(() => store.gameState()?.isTimerRunning ?? false),
    
    // Computed: remaining time
    remainingTime: computed(() => store.gameState()?.remainingTime ?? 0),
  })),
  
  withMethods((store) => ({
    // Initialize game state
    setGameState(gameState: GameState): void {
      patchState(store, { gameState });
    },
    
    // Set players
    setPlayers(players: Player[]): void {
      patchState(store, { players });
    },
    
    // Update score for a court
    updateScore(courtId: number, team: 'team1' | 'team2', value: number): void {
      const currentScores = store.matchScores();
      const courtScores = currentScores[courtId] ?? { team1: 0, team2: 0 };
      
      patchState(store, {
        matchScores: {
          ...currentScores,
          [courtId]: {
            ...courtScores,
            [team]: Math.max(0, value)
          }
        }
      });
    },
    
    // Reset all match scores
    resetMatchScores(): void {
      patchState(store, { matchScores: {} });
    },
    
    // Update player stats after match - accumulative scoring
    updatePlayerStats(playerId: string, won: boolean, teamScore: number): void {
      const players = store.players();
      const updatedPlayers = players.map(player => {
        if (player.id === playerId) {
          const newPlayer = { ...player };
          newPlayer.matchesPlayed++;
          
          if (won) {
            newPlayer.wins++;
          }
          
          // Accumulate the team score directly (cumulative scoring)
          newPlayer.totalPoints += teamScore;
          
          return newPlayer;
        }
        return player;
      });
      
      patchState(store, { players: updatedPlayers });
    },
    
    // Save to localStorage
    persistToStorage(): void {
      const state = {
        gameState: store.gameState(),
        players: store.players(),
        matchScores: store.matchScores(),
        timestamp: Date.now()
      };
      localStorage.setItem('square-circle-game', JSON.stringify(state));
    },
    
    // Load from localStorage
    loadFromStorage(): boolean {
      const saved = localStorage.getItem('square-circle-game');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          // Check if not too old (24h)
          if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
            patchState(store, {
              gameState: state.gameState,
              players: state.players,
              matchScores: state.matchScores
            });
            return true;
          }
        } catch (e) {
          console.error('Failed to load game state', e);
        }
      }
      return false;
    },
    
    // Clear storage
    clearStorage(): void {
      localStorage.removeItem('square-circle-game');
      patchState(store, initialState);
    },
    
    // Export game as JSON
    exportToJSON(): void {
      const state = {
        exportDate: new Date().toISOString(),
        gameState: store.gameState(),
        players: store.players(),
        matchScores: store.matchScores()
      };
      
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ronde-des-carres-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }))
);

export type GameStoreType = InstanceType<typeof GameStore>;
