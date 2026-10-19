// Visual minimalista: fundo escuro neutro, superfícies sem borda, um único destaque.
// Quando o nome e a marca definitivos chegarem, só esta parte muda.
export const colors = {
  bg: "#0C0C0D",
  card: "#151517",
  cardBorder: "#232326", // usado só em divisórias finas
  input: "#1D1D20",
  text: "#F4F4F5",
  muted: "#8B8B92",
  faint: "#55555C",
  primary: "#E6C35C",
  primarySoft: "rgba(230,195,92,0.12)",
  primaryText: "#0C0C0D",
  danger: "#FF5A5F",
  success: "#7BD389",
  water: "#6EC6FF",
  protein: "#FF8A80",
  carbs: "#FFCC80",
  fats: "#A5D6A7",
};

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const type = {
  title: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.6 },
  h2: { fontSize: 18, fontWeight: "600" as const, letterSpacing: -0.2 },
  label: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.8, textTransform: "uppercase" as const },
  big: { fontSize: 34, fontWeight: "700" as const, letterSpacing: -1 },
};
