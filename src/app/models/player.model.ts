export interface Player {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  level?: number;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
}

export interface PlayerForm {
  firstName: string;
  lastName: string;
  level?: number;
}
