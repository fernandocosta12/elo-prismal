// Demonstração do exercício: alterna a foto de início e de fim do movimento (efeito de GIF curto),
// e a tela "Como fazer" com o passo a passo.
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GROUP_LABEL, exerciseImages, findExercise, type ExerciseTemplate } from "@/lib/exercises";
import { colors, radius, space, type } from "@/theme";

export function ExerciseAnimation({ ex, size, rounded = radius.md, playing = true }: { ex?: ExerciseTemplate | null; size: number; rounded?: number; playing?: boolean }) {
  const imgs = exerciseImages(ex);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!playing || imgs.length < 2) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % 2), 800);
    return () => clearInterval(id);
  }, [playing, imgs.length]);

  if (!imgs.length) {
    return (
      <View style={{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.input, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="barbell-outline" size={size * 0.35} color={colors.faint} />
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, borderRadius: rounded, overflow: "hidden", backgroundColor: "#fff" }}>
      {/* As duas imagens ficam carregadas; só a opacidade muda, para não piscar */}
      {imgs.map((u, i) => (
        <Image
          key={u}
          source={{ uri: u }}
          resizeMode="cover"
          style={{ position: "absolute", width: size, height: size, opacity: frame === i ? 1 : 0 }}
          accessibilityLabel={i === 0 ? `${ex?.name}: posição inicial` : `${ex?.name}: posição final`}
        />
      ))}
    </View>
  );
}

export function ExerciseDetail({ name, onClose }: { name: string | null; onClose: () => void }) {
  const ex = name ? findExercise(name) : null;
  return (
    <Modal visible={!!name} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: space.lg }}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: 60, gap: space.lg }}>
          <Text style={[type.title, { color: colors.text }]}>{name}</Text>
          {ex ? (
            <>
              <Text style={{ color: colors.muted }}>
                {ex.groups.map((g) => GROUP_LABEL[g]).join(" · ")} · {ex.sets}x {ex.reps}
              </Text>
              <View style={{ alignItems: "center" }}>
                <ExerciseAnimation ex={ex} size={300} rounded={radius.lg} />
              </View>
              <Text style={[type.label, { color: colors.muted, marginTop: space.sm }]}>Como fazer</Text>
              {ex.steps.map((s, i) => (
                <View key={i} style={{ flexDirection: "row", gap: space.md }}>
                  <Text style={{ color: colors.primary, fontWeight: "700", width: 18 }}>{i + 1}</Text>
                  <Text style={{ color: colors.text, flex: 1, lineHeight: 22, fontSize: 15 }}>{s}</Text>
                </View>
              ))}
              {ex.tip && (
                <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.sm, padding: space.lg, flexDirection: "row", gap: space.md }}>
                  <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, flex: 1, lineHeight: 20 }}>{ex.tip}</Text>
                </View>
              )}
              <Text style={{ color: colors.faint, fontSize: 11 }}>Imagens: Free Exercise DB (domínio público).</Text>
            </>
          ) : (
            <Text style={{ color: colors.muted }}>Exercício personalizado — sem demonstração disponível.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
