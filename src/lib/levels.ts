export type Level = { name: string; min: number; max: number; color: string };

export const LEVELS: Level[] = [
  { name: "Bronze", min: 0, max: 9, color: "#cd7f32" },
  { name: "Prata", min: 10, max: 29, color: "#c0c0c0" },
  { name: "Ouro", min: 30, max: 59, color: "#f5c542" },
  { name: "Platina", min: 60, max: 119, color: "#e5e4e2" },
  { name: "Diamante", min: 120, max: 249, color: "#5cdcff" },
  { name: "Lenda", min: 250, max: Infinity, color: "#ff6b6b" },
];

export function getLevel(total: number): Level {
  return LEVELS.find((l) => total >= l.min && total <= l.max) ?? LEVELS[0];
}

export function getNextLevel(total: number): Level | null {
  const i = LEVELS.findIndex((l) => total >= l.min && total <= l.max);
  return i < 0 || i >= LEVELS.length - 1 ? null : LEVELS[i + 1];
}
