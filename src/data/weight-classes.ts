export interface WeightClass {
  readonly id: string;
  readonly name: string;
  readonly minWeightLbs: number;
  readonly maxWeightLbs: number;
  readonly minWeightKg: number;
  readonly maxWeightKg: number;
}

/**
 * Professional boxing weight classes from Minimumweight to Heavyweight.
 * Weights are the official sanctioning limits (lbs / kg).
 */
export const WEIGHT_CLASSES: readonly WeightClass[] = [
  { id: 'minimumweight', name: 'Minimumweight', minWeightLbs: 0, maxWeightLbs: 105, minWeightKg: 0, maxWeightKg: 47.6 },
  { id: 'light-flyweight', name: 'Light Flyweight', minWeightLbs: 105, maxWeightLbs: 108, minWeightKg: 47.6, maxWeightKg: 48.9 },
  { id: 'flyweight', name: 'Flyweight', minWeightLbs: 108, maxWeightLbs: 112, minWeightKg: 48.9, maxWeightKg: 50.8 },
  { id: 'super-flyweight', name: 'Super Flyweight', minWeightLbs: 112, maxWeightLbs: 115, minWeightKg: 50.8, maxWeightKg: 52.2 },
  { id: 'bantamweight', name: 'Bantamweight', minWeightLbs: 115, maxWeightLbs: 118, minWeightKg: 52.2, maxWeightKg: 53.5 },
  { id: 'super-bantamweight', name: 'Super Bantamweight', minWeightLbs: 118, maxWeightLbs: 122, minWeightKg: 53.5, maxWeightKg: 55.3 },
  { id: 'featherweight', name: 'Featherweight', minWeightLbs: 122, maxWeightLbs: 126, minWeightKg: 55.3, maxWeightKg: 57.2 },
  { id: 'super-featherweight', name: 'Super Featherweight', minWeightLbs: 126, maxWeightLbs: 130, minWeightKg: 57.2, maxWeightKg: 59.0 },
  { id: 'lightweight', name: 'Lightweight', minWeightLbs: 130, maxWeightLbs: 135, minWeightKg: 59.0, maxWeightKg: 61.2 },
  { id: 'super-lightweight', name: 'Super Lightweight', minWeightLbs: 135, maxWeightLbs: 140, minWeightKg: 61.2, maxWeightKg: 63.5 },
  { id: 'welterweight', name: 'Welterweight', minWeightLbs: 140, maxWeightLbs: 147, minWeightKg: 63.5, maxWeightKg: 66.7 },
  { id: 'super-welterweight', name: 'Super Welterweight', minWeightLbs: 147, maxWeightLbs: 154, minWeightKg: 66.7, maxWeightKg: 69.9 },
  { id: 'middleweight', name: 'Middleweight', minWeightLbs: 154, maxWeightLbs: 160, minWeightKg: 69.9, maxWeightKg: 72.6 },
  { id: 'super-middleweight', name: 'Super Middleweight', minWeightLbs: 160, maxWeightLbs: 168, minWeightKg: 72.6, maxWeightKg: 76.2 },
  { id: 'light-heavyweight', name: 'Light Heavyweight', minWeightLbs: 168, maxWeightLbs: 175, minWeightKg: 76.2, maxWeightKg: 79.4 },
  { id: 'cruiserweight', name: 'Cruiserweight', minWeightLbs: 175, maxWeightLbs: 200, minWeightKg: 79.4, maxWeightKg: 90.7 },
  { id: 'heavyweight', name: 'Heavyweight', minWeightLbs: 200, maxWeightLbs: Infinity, minWeightKg: 90.7, maxWeightKg: Infinity },
];

export const WEIGHT_CLASS_BY_ID = new Map(WEIGHT_CLASSES.map((wc) => [wc.id, wc]));

export function findWeightClass(id: string): WeightClass | undefined {
  return WEIGHT_CLASS_BY_ID.get(id);
}

export function weightClassForWeightKg(kg: number): WeightClass | undefined {
  for (const wc of WEIGHT_CLASSES) {
    if (kg >= wc.minWeightKg && kg <= wc.maxWeightKg) {
      return wc;
    }
  }
  return undefined;
}
