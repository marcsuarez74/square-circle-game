import { Court } from './court.model';
import { Player } from './player.model';

export interface GameState {
  courts: Court[];
  waitingQueue: Player[];
  isTimerRunning: boolean;
  remainingTime: number;
  currentSet: number;
}
