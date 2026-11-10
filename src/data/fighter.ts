export interface FighterProfile {
  readonly id: string;
  firstName: string;
  lastName: string;
  heightCm: number;
  weightClassId: string;
  weightKg: number;
  createdAt: number;
  wins: number;
  losses: number;
  draws: number;
  knockoutWins: number;
  rank: number;
}

export interface CreateFighterInput {
  firstName: string;
  lastName: string;
  heightCm: number;
  weightClassId: string;
  weightKg: number;
}

export function newFighterId(): string {
  return `fighter_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyFighter(): CreateFighterInput {
  return { firstName: '', lastName: '', heightCm: 0, weightClassId: '', weightKg: 0 };
}

export function createFighter(input: CreateFighterInput): FighterProfile {
  return {
    id: newFighterId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    heightCm: input.heightCm,
    weightClassId: input.weightClassId,
    weightKg: input.weightKg,
    createdAt: Date.now(),
    wins: 0,
    losses: 0,
    draws: 0,
    knockoutWins: 0,
    rank: 1,
  };
}

export function fighterDisplayName(f: FighterProfile): string {
  return `${f.firstName} ${f.lastName}`.trim() || 'Unnamed Boxer';
}

export function fighterRecord(f: FighterProfile): string {
  return `${f.wins}-${f.losses}-${f.draws}`;
}
