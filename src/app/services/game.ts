import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { Court } from '../models/court.model';
import { GameConfig } from '../models/game-config.model';
import { GameState } from '../models/game-state.model';
import { Player } from '../models/player.model';
import { PlayerService } from './player';
import { GameStore } from './game-storage';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private config: GameConfig = {
    numberOfCourts: 2,
    matchDuration: 900,
  };

  private state: GameState = {
    courts: [],
    waitingQueue: [],
    isTimerRunning: false,
    remainingTime: 0,
    currentSet: 1,
  };

  private stateSubject = new BehaviorSubject<GameState>(this.state);
  private timerSubscription: Subscription | null = null;
  private previousAssignments: Map<number, string[][]> = new Map(); // courtId -> array of player pairs

  constructor(private playerService: PlayerService) {}

  getState$(): Observable<GameState> {
    return this.stateSubject.asObservable();
  }

  getCurrentState(): GameState {
    return { ...this.state };
  }

  setConfig(config: GameConfig): void {
    this.config = { ...config };
    this.initializeCourts();
    this.state.remainingTime = config.matchDuration;
    this.stateSubject.next({ ...this.state });
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }

  initializeCourts(): void {
    this.state.courts = Array.from({ length: this.config.numberOfCourts }, (_, i) => ({
      id: i + 1,
      name: `Terrain ${i + 1}`,
      players: [],
    }));
    this.stateSubject.next({ ...this.state });
  }

  assignPlayersToCourts(players: Player[]): void {
    // Assign players respecting singles/doubles rules
    const assignments = this.createBalancedAssignments(players);

    this.state.courts = assignments.courts;
    this.state.waitingQueue = assignments.waitingQueue;

    // Record encounters for each court (singles also record encounters)
    this.state.courts.forEach((court) => {
      if (court.players.length >= 2) {
        this.recordCourtEncounters(court);
      }
    });

    this.stateSubject.next({ ...this.state });
  }

  private createBalancedAssignments(players: Player[]): {
    courts: Court[];
    waitingQueue: Player[];
  } {
    const courts: Court[] = this.state.courts.map((court) => ({
      ...court,
      players: [],
    }));
    const waitingQueue: Player[] = [];

    // Shuffle players
    let availablePlayers = this.shuffleArray([...players]);
    const totalPlayers = availablePlayers.length;

    // Case: Exactly 2 players -> 1 single
    if (totalPlayers === 2) {
      courts[0].players = availablePlayers.splice(0, 2);
      return { courts, waitingQueue };
    }

    // Case: Odd number of players
    // Remove 1 player to make it even if we can't fill all courts perfectly
    const numCourts = courts.length;
    const maxCapacity = numCourts * 4;

    // If odd number and we have enough courts, put 1 in waiting queue
    if (totalPlayers % 2 === 1) {
      // Put the last player in waiting queue
      const lastPlayer = availablePlayers.pop()!;
      waitingQueue.push(lastPlayer);
    }

    // Now we have an even number of players
    // Strategy: Fill courts optimally (prioritize doubles, allow singles if needed)
    let remainingPlayers = availablePlayers.length;

    for (let i = 0; i < numCourts && remainingPlayers > 0; i++) {
      const court = courts[i];

      if (remainingPlayers >= 4) {
        // Enough for a double
        const team = this.selectBestTeam(availablePlayers, i + 1);
        if (team.length === 4) {
          court.players = team;
          availablePlayers = availablePlayers.filter((p) => !team.find((tp) => tp.id === p.id));
          remainingPlayers -= 4;
        } else {
          // Anti-repetition failed, take random 4
          court.players = availablePlayers.splice(0, 4);
          remainingPlayers -= 4;
        }
      } else if (remainingPlayers >= 2) {
        // Not enough for double, but enough for single
        // Only create single if it's exactly 2, or if we have no other courts to fill
        // AND there won't be any 2v1 situation
        const playersForSingle = availablePlayers.splice(0, 2);
        court.players = playersForSingle;
        remainingPlayers -= 2;
      }
    }

    // Remaining players go to waiting queue
    waitingQueue.push(...availablePlayers);

    return { courts, waitingQueue };
  }

  private selectBestTeam(players: Player[], courtId: number): Player[] {
    // Try to select 4 players who haven't played together
    for (let i = 0; i < players.length - 3; i++) {
      for (let j = i + 1; j < players.length - 2; j++) {
        for (let k = j + 1; k < players.length - 1; k++) {
          for (let l = k + 1; l < players.length; l++) {
            const team = [players[i], players[j], players[k], players[l]];

            if (this.isValidTeam(team, courtId)) {
              return team;
            }
          }
        }
      }
    }

    return [];
  }

  private selectBestPair(players: Player[], courtId: number): Player[] {
    // Try to select 2 players who haven't played together
    for (let i = 0; i < players.length - 1; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const pair = [players[i], players[j]];

        if (!this.playerService.havePlayedTogether(pair[0].id, pair[1].id)) {
          return pair;
        }
      }
    }

    return [];
  }

  private isValidTeam(team: Player[], courtId: number): boolean {
    // Check if any pair in the team has played together before
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        if (this.playerService.havePlayedTogether(team[i].id, team[j].id)) {
          return false;
        }
      }
    }
    return true;
  }

  private recordCourtEncounters(court: Court): void {
    if (court.players.length !== 2 && court.players.length !== 4) return;

    // Record all pairs on this court (for both singles and doubles)
    for (let i = 0; i < court.players.length; i++) {
      for (let j = i + 1; j < court.players.length; j++) {
        this.playerService.recordEncounter(court.players[i].id, court.players[j].id);
      }
    }

    // Store assignment for history
    if (court.players.length === 4) {
      const pairs = [];
      for (let i = 0; i < 4; i += 2) {
        pairs.push([court.players[i].id, court.players[i + 1].id]);
      }
      this.previousAssignments.set(court.id, pairs);
    } else if (court.players.length === 2) {
      this.previousAssignments.set(court.id, [[court.players[0].id, court.players[1].id]]);
    }
  }

  shufflePlayers(): void {
    const allPlayers = [...this.state.courts.flatMap((c) => c.players), ...this.state.waitingQueue];
    this.assignPlayersToCourts(allPlayers);
  }

  startTimer(): void {
    if (this.state.isTimerRunning) return;

    this.state.isTimerRunning = true;
    this.stateSubject.next({ ...this.state });

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.state.remainingTime > 0) {
        this.state.remainingTime--;
        this.stateSubject.next({ ...this.state });
      } else {
        this.stopTimer();
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.state.isTimerRunning = false;
    this.stateSubject.next({ ...this.state });
  }

  resetTimer(): void {
    this.stopTimer();
    this.state.remainingTime = this.config.matchDuration;
    this.stateSubject.next({ ...this.state });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  nextRound(updatedPlayers?: Player[]): void {
    this.state.currentSet++;
    this.resetTimer();

    // Rotate players with fair distribution logic
    this.rotatePlayers(updatedPlayers);
  }

  private rotatePlayers(updatedPlayers?: Player[]): void {
    // Use updated players from store if provided, otherwise use local state
    let allPlayers: Player[];

    if (updatedPlayers) {
      // Map updated players to current court/waiting distribution
      const courtPlayerIds = new Set(this.state.courts.flatMap((c) => c.players.map((p) => p.id)));
      const waitingIds = new Set(this.state.waitingQueue.map((p) => p.id));

      const courtPlayers = updatedPlayers.filter((p) => courtPlayerIds.has(p.id));
      const waitingPlayers = updatedPlayers.filter((p) => waitingIds.has(p.id));

      allPlayers = [...courtPlayers, ...waitingPlayers];
    } else {
      allPlayers = [...this.state.courts.flatMap((c) => c.players), ...this.state.waitingQueue];
    }

    // Get previous distribution
    const previousCourtPlayers = this.state.courts.flatMap((c) => c.players);
    const previousWaitingIds = new Set(this.state.waitingQueue.map((p) => p.id));
    const previousCourtIds = new Set(previousCourtPlayers.map((p) => p.id));

    // Assign players with rotation logic
    this.assignPlayersWithRotation(allPlayers, previousWaitingIds, previousCourtIds);
  }

  private assignPlayersWithRotation(
    allPlayers: Player[],
    previousWaitingIds: Set<string>,
    previousCourtIds: Set<string>,
  ): void {
    const courts: Court[] = this.state.courts.map((court) => ({
      ...court,
      players: [],
    }));
    const waitingQueue: Player[] = [];

    const numCourts = courts.length;
    const maxCapacity = numCourts * 4;

    // Manche 2: Full swap - waiting players play, playing players wait
    if (this.state.currentSet === 2 && previousWaitingIds.size > 0) {
      // Separate players by previous status
      const mustPlayNow = allPlayers.filter((p) => previousWaitingIds.has(p.id));
      const mustWaitNow = allPlayers.filter((p) => previousCourtIds.has(p.id));

      // Calculate how many of the must-play players we can fit
      let availableSlots = maxCapacity;
      let playersToPlay: Player[] = [];
      let remainingMustPlay = [...mustPlayNow];

      // Fill with must-play players first
      for (let i = 0; i < numCourts; i++) {
        if (remainingMustPlay.length === 0) break;

        const court = courts[i];

        if (remainingMustPlay.length >= 4) {
          court.players = remainingMustPlay.splice(0, 4);
          availableSlots -= 4;
        } else if (remainingMustPlay.length >= 2) {
          court.players = remainingMustPlay.splice(0, 2);
          availableSlots -= 2;
        } else if (remainingMustPlay.length === 1) {
          // Odd player - put in waiting queue
          break;
        }
      }

      // If there are remaining slots after placing must-play players
      // and we have more players available, fill them
      let remainingPlayers = allPlayers.filter(
        (p) => !courts.some((c) => c.players.some((cp) => cp.id === p.id)),
      );

      for (let i = 0; i < numCourts; i++) {
        const court = courts[i];
        if (remainingPlayers.length === 0) break;

        if (court.players.length === 0) {
          if (remainingPlayers.length >= 4) {
            court.players = remainingPlayers.splice(0, 4);
          } else if (remainingPlayers.length >= 2) {
            court.players = remainingPlayers.splice(0, 2);
          } else if (remainingPlayers.length === 1) {
            // Single player - put in waiting queue
            break;
          }
        } else if (court.players.length === 2 && remainingPlayers.length >= 2) {
          // Single can become double
          court.players = [...court.players, ...remainingPlayers.splice(0, 2)];
        }
      }

      // Everyone else goes to waiting queue
      waitingQueue.push(
        ...allPlayers.filter((p) => !courts.some((c) => c.players.some((cp) => cp.id === p.id))),
      );
    } else {
      // Manche 3+: Sort by matches played and fill courts
      allPlayers.sort((a, b) => a.matchesPlayed - b.matchesPlayed);

      let availablePlayers = [...allPlayers];

      for (let i = 0; i < numCourts && availablePlayers.length > 0; i++) {
        const court = courts[i];

        if (availablePlayers.length >= 4) {
          court.players = availablePlayers.splice(0, 4);
        } else if (availablePlayers.length >= 2) {
          court.players = availablePlayers.splice(0, 2);
        }
      }

      waitingQueue.push(...availablePlayers);
    }

    // Update state
    this.state.courts = courts;
    this.state.waitingQueue = waitingQueue;

    this.stateSubject.next({ ...this.state });
  }

  resetGame(): void {
    this.stopTimer();
    this.state = {
      courts: [],
      waitingQueue: [],
      isTimerRunning: false,
      remainingTime: 0,
      currentSet: 1,
    };
    this.config = {
      numberOfCourts: 2,
      matchDuration: 900,
    };
    this.previousAssignments.clear();
    this.stateSubject.next({ ...this.state });
  }
}
