// Sugestão de treino do dia — regras simples, sem custo de IA.
// Usa: objetivo, equipamento disponível, nível de atividade, esporte foco e o que foi treinado nos últimos dias.
import { EXERCISES, findExercise, type Equip, type Exercise, type ExerciseTemplate, type MuscleGroup } from "./exercises";
import type { Profile } from "./auth";

export type Suggestion = {
  key: string;
  title: string;
  groups: MuscleGroup[];
  exercises: Exercise[];
  why: string;
};

// Divisões de treino (cada item é um "dia")
const SPLIT_FULL: { key: string; title: string; groups: MuscleGroup[] }[] = [
  { key: "fullA", title: "Corpo todo A", groups: ["perna", "peito", "costas", "core"] },
  { key: "fullB", title: "Corpo todo B", groups: ["gluteo", "ombro", "costas", "core"] },
];
const SPLIT_4: { key: string; title: string; groups: MuscleGroup[] }[] = [
  { key: "push", title: "Peito e tríceps", groups: ["peito", "triceps"] },
  { key: "pull", title: "Costas e bíceps", groups: ["costas", "biceps"] },
  { key: "legs", title: "Pernas e glúteos", groups: ["perna", "gluteo"] },
  { key: "shoulders", title: "Ombros e abdômen", groups: ["ombro", "core"] },
];
const RUN_DAY = { key: "run", title: "Corrida + fortalecimento", groups: ["cardio", "perna", "core"] as MuscleGroup[] };

function allowedEquip(profile: Profile): Equip[] {
  if (profile.fitness_level === "completo") return ["corpo", "halter", "academia"];
  if (profile.fitness_level === "basico") return ["corpo", "halter"];
  return ["corpo"];
}

function prescription(goal: string | null) {
  switch (goal) {
    case "perda_de_peso":
      return { sets: 3, reps: "12-15", rest: "45", why: "séries mais longas e descanso curto para gastar mais energia" };
    case "ganho_de_massa":
      return { sets: 4, reps: "8-10", rest: "90", why: "carga moderada a alta para ganhar força e massa" };
    case "performance":
      return { sets: 4, reps: "6-8", rest: "120", why: "poucas repetições com mais carga para força e potência" };
    default:
      return { sets: 3, reps: "10-12", rest: "60", why: "volume equilibrado para manter a forma" };
  }
}

// Quais "dias" da divisão foram feitos recentemente (pelo título salvo)
function recentKeys(recentTitles: string[], split: { key: string; title: string }[]) {
  const done = new Set<string>();
  for (const t of recentTitles) {
    const hit = split.find((s) => t.toLowerCase().includes(s.title.toLowerCase()));
    if (hit) done.add(hit.key);
  }
  return done;
}

function pickExercises(groups: MuscleGroup[], equip: Equip[], count: number, seed: number): ExerciseTemplate[] {
  const pool = EXERCISES.filter((e) => equip.includes(e.equip) && !e.groups.includes("cardio"));
  const chosen: ExerciseTemplate[] = [];
  // Um composto para cada grupo principal, depois isolados, até completar
  for (const pass of [true, false]) {
    for (const g of groups) {
      const options = pool.filter((e) => e.groups[0] === g && !!e.compound === pass && !chosen.includes(e));
      if (options.length) chosen.push(options[(seed + chosen.length) % options.length]);
      if (chosen.length >= count) return chosen;
    }
  }
  // Completa com qualquer exercício dos grupos
  for (const e of pool) {
    if (chosen.length >= count) break;
    if (!chosen.includes(e) && e.groups.some((g) => groups.includes(g))) chosen.push(e);
  }
  return chosen;
}

export function suggestWorkout(profile: Profile, recentTitles: string[], offset = 0): Suggestion {
  const equip = allowedEquip(profile);
  const rx = prescription(profile.goal);
  const beginner = ["sedentario", "leve"].includes(profile.activity_level ?? "") || equip.length === 1;
  const split = beginner ? SPLIT_FULL : SPLIT_4;

  // Quem foca em corrida: a cada 3 sugestões, uma é corrida
  const runner = profile.sport_focus === "corrida";
  const done = recentKeys(recentTitles, split);
  const pending = split.filter((s) => !done.has(s.key));
  const ordered = [...pending, ...split.filter((s) => done.has(s.key))];
  const options = runner ? [RUN_DAY, ...ordered] : ordered;
  const day = options[offset % options.length];

  const count = beginner ? 5 : 6;
  const picks = day.key === "run"
    ? [findExercise("Corrida (esteira/rua)")!, ...pickExercises(["perna", "core"], equip, 3, offset)]
    : pickExercises(day.groups, equip, count, offset);

  const exercises: Exercise[] = picks.filter(Boolean).map((p) =>
    p.groups.includes("cardio") || p.reps.includes("s") || p.reps.includes("min")
      ? { name: p.name, sets: p.sets, reps: p.reps, rest: p.rest, notes: "", done: false }
      : { name: p.name, sets: rx.sets, reps: p.reps.includes("cada") ? `${rx.reps} cada` : rx.reps, rest: rx.rest, notes: "", done: false }
  );

  const equipText = equip.length === 1 ? "só com o peso do corpo" : equip.length === 2 ? "com halteres" : "na academia";
  return {
    key: day.key,
    title: day.title,
    groups: day.groups,
    exercises,
    why: `${day.title} ${equipText}: ${rx.why}.`,
  };
}
