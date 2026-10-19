// Biblioteca de exercícios (mesma do app original).
export type MuscleGroup =
  | "peito" | "costas" | "perna" | "gluteo" | "ombro"
  | "biceps" | "triceps" | "core" | "cardio" | "fullbody";

export type ExerciseTemplate = {
  name: string;
  groups: MuscleGroup[];
  sets: number;
  reps: string;
  rest: string;
};

// Formato salvo no banco (compatível com os treinos antigos; weight e done são novos e opcionais)
export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  weight?: number | null;
  done?: boolean;
};

export const WORKOUT_TYPES: { id: MuscleGroup | "livre"; label: string; emoji: string }[] = [
  { id: "fullbody", label: "Full Body", emoji: "🏋️" },
  { id: "peito", label: "Peito", emoji: "💪" },
  { id: "costas", label: "Costas", emoji: "🦅" },
  { id: "perna", label: "Perna", emoji: "🦵" },
  { id: "gluteo", label: "Glúteo", emoji: "🍑" },
  { id: "ombro", label: "Ombro", emoji: "🏐" },
  { id: "biceps", label: "Bíceps", emoji: "💪" },
  { id: "triceps", label: "Tríceps", emoji: "🔱" },
  { id: "core", label: "Abdômen", emoji: "🔥" },
  { id: "cardio", label: "Cardio", emoji: "🏃" },
  { id: "livre", label: "Livre", emoji: "✨" },
];

const E = (name: string, groups: MuscleGroup[], sets: number, reps: string, rest: string): ExerciseTemplate => ({
  name, groups, sets, reps, rest,
});

export const EXERCISES: ExerciseTemplate[] = [
  // Peito
  E("Supino reto com barra", ["peito"], 4, "8-10", "90"),
  E("Supino inclinado com halteres", ["peito"], 4, "10", "75"),
  E("Supino declinado", ["peito"], 3, "10", "75"),
  E("Crucifixo com halteres", ["peito"], 3, "12", "60"),
  E("Crossover na polia", ["peito"], 3, "12-15", "60"),
  E("Flexão de braço", ["peito", "fullbody"], 3, "máx", "60"),
  E("Peck deck (voador)", ["peito"], 3, "12", "60"),
  E("Paralelas (mergulho no peito)", ["peito", "triceps"], 3, "8-10", "75"),
  // Costas
  E("Barra fixa", ["costas", "biceps"], 4, "máx", "90"),
  E("Puxada frontal (pulley)", ["costas"], 4, "10-12", "75"),
  E("Remada curvada com barra", ["costas"], 4, "8-10", "90"),
  E("Remada cavalinho", ["costas"], 3, "10", "75"),
  E("Remada unilateral com halter", ["costas"], 3, "10 cada", "60"),
  E("Remada baixa na polia", ["costas"], 3, "12", "60"),
  E("Levantamento terra", ["costas", "perna", "fullbody"], 4, "6-8", "120"),
  E("Pull-over com halter", ["costas", "peito"], 3, "12", "60"),
  E("Hiperextensão lombar", ["costas", "core"], 3, "15", "45"),
  // Perna
  E("Agachamento livre", ["perna", "gluteo"], 4, "8-10", "120"),
  E("Agachamento frontal", ["perna"], 4, "8", "120"),
  E("Leg press 45°", ["perna", "gluteo"], 4, "10-12", "90"),
  E("Cadeira extensora", ["perna"], 3, "12", "60"),
  E("Cadeira flexora", ["perna"], 3, "12", "60"),
  E("Mesa flexora", ["perna"], 3, "12", "60"),
  E("Stiff com halteres", ["perna", "gluteo"], 4, "10", "75"),
  E("Afundo (avanço)", ["perna", "gluteo"], 3, "10 cada", "75"),
  E("Búlgaro", ["perna", "gluteo"], 3, "10 cada", "75"),
  E("Panturrilha em pé", ["perna"], 4, "15-20", "45"),
  E("Panturrilha sentado", ["perna"], 4, "15", "45"),
  // Glúteo
  E("Hip thrust", ["gluteo"], 4, "10-12", "75"),
  E("Elevação pélvica", ["gluteo"], 3, "12", "60"),
  E("Coice na polia", ["gluteo"], 3, "12 cada", "45"),
  E("Abdução de quadril (máquina)", ["gluteo"], 3, "15", "45"),
  E("Glute kickback", ["gluteo"], 3, "12 cada", "45"),
  // Ombro
  E("Desenvolvimento militar com barra", ["ombro"], 4, "8-10", "90"),
  E("Desenvolvimento com halteres", ["ombro"], 4, "10", "75"),
  E("Elevação lateral", ["ombro"], 4, "12-15", "45"),
  E("Elevação frontal", ["ombro"], 3, "12", "45"),
  E("Crucifixo invertido", ["ombro", "costas"], 3, "12", "60"),
  E("Encolhimento (trapézio)", ["ombro", "costas"], 3, "15", "45"),
  E("Arnold press", ["ombro"], 3, "10", "75"),
  // Bíceps
  E("Rosca direta com barra", ["biceps"], 4, "10", "60"),
  E("Rosca alternada com halteres", ["biceps"], 3, "10 cada", "45"),
  E("Rosca martelo", ["biceps"], 3, "12", "45"),
  E("Rosca scott", ["biceps"], 3, "10", "60"),
  E("Rosca concentrada", ["biceps"], 3, "12 cada", "45"),
  E("Rosca 21", ["biceps"], 3, "21", "60"),
  // Tríceps
  E("Tríceps na polia (corda)", ["triceps"], 4, "12", "45"),
  E("Tríceps testa", ["triceps"], 3, "10", "60"),
  E("Tríceps francês", ["triceps"], 3, "10", "60"),
  E("Tríceps coice", ["triceps"], 3, "12 cada", "45"),
  E("Mergulho no banco", ["triceps"], 3, "12", "60"),
  E("Supino fechado", ["triceps", "peito"], 4, "8", "75"),
  // Core
  E("Prancha frontal", ["core"], 3, "30-60s", "30"),
  E("Prancha lateral", ["core"], 3, "30s cada", "30"),
  E("Abdominal supra", ["core"], 3, "20", "30"),
  E("Abdominal infra (elevação de pernas)", ["core"], 3, "15", "30"),
  E("Abdominal oblíquo", ["core"], 3, "15 cada", "30"),
  E("Russian twist", ["core"], 3, "20", "30"),
  E("Hollow hold", ["core"], 3, "20-30s", "30"),
  E("Mountain climber", ["core", "cardio", "fullbody"], 3, "30s", "30"),
  E("Dead bug", ["core"], 3, "12 cada", "30"),
  // Cardio
  E("Esteira (caminhada inclinada)", ["cardio"], 1, "20-30 min", "0"),
  E("Corrida (esteira/rua)", ["cardio"], 1, "20-40 min", "0"),
  E("Bicicleta ergométrica", ["cardio"], 1, "20-30 min", "0"),
  E("Elíptico", ["cardio"], 1, "20-30 min", "0"),
  E("Pular corda", ["cardio", "fullbody"], 5, "2 min", "60"),
  E("Remo ergômetro", ["cardio", "fullbody"], 5, "500m", "90"),
  E("HIIT - sprint", ["cardio"], 8, "30s", "60"),
  E("Burpee", ["cardio", "fullbody"], 4, "10-15", "60"),
  // Full body
  E("Clean & press", ["fullbody", "ombro", "perna"], 4, "6", "120"),
  E("Thruster", ["fullbody", "ombro", "perna"], 4, "8", "90"),
  E("Kettlebell swing", ["fullbody", "gluteo", "core"], 4, "15", "60"),
  E("Turkish get-up", ["fullbody", "core"], 3, "5 cada", "60"),
  E("Snatch", ["fullbody"], 4, "5", "120"),
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchExercises(query: string, type: MuscleGroup | "livre" | null): ExerciseTemplate[] {
  const q = norm(query.trim());
  const pool = !type || type === "livre" ? EXERCISES : EXERCISES.filter((e) => e.groups.includes(type));
  return q ? pool.filter((e) => norm(e.name).includes(q)) : pool;
}

export function workoutTitle(type: MuscleGroup | "livre" | null): string {
  const t = WORKOUT_TYPES.find((w) => w.id === type);
  return !t || t.id === "livre" ? "Treino livre" : `Treino de ${t.label}`;
}

// Pace em segundos por km -> "5'30\""
export function formatPace(secPerKm: number | null | undefined): string {
  if (!secPerKm || !isFinite(secPerKm)) return "–";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, "0")}"/km`;
}
