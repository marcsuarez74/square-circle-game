import { Player } from './player.model';

export interface Court {
  id: number;
  name: string;
  players: Player[];
}
