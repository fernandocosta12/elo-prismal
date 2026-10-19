// Lista de mercado
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { addShopping, listShopping, type ShoppingItem } from "@/lib/plan";
import { Screen } from "@/components/Screen";
import { Button, Card, Muted, styles as ui } from "@/components/ui";
import { colors, space } from "@/theme";

export default function Mercado() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    setItems(await listShopping(userId));
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const add = async () => {
    if (!userId || !text.trim()) return;
    // "2 kg arroz" ou só "arroz"
    const lines = text.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
    try {
      await addShopping(userId, lines.map((name) => ({ name })));
      setText("");
      load();
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    }
  };

  const toggle = async (it: ShoppingItem) => {
    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x)));
    await supabase.from("shopping_items").update({ checked: !it.checked }).eq("id", it.id);
  };

  const remove = async (it: ShoppingItem) => {
    setItems((prev) => prev.filter((x) => x.id !== it.id));
    await supabase.from("shopping_items").delete().eq("id", it.id);
  };

  const clearChecked = () =>
    Alert.alert("Limpar comprados?", "Os itens marcados saem da lista.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpar",
        style: "destructive",
        onPress: async () => {
          await supabase.from("shopping_items").delete().eq("user_id", userId!).eq("checked", true);
          load();
        },
      },
    ]);

  const pending = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  return (
    <Screen title="Lista de mercado" subtitle={pending.length ? `${pending.length} itens para comprar` : "Tudo comprado por aqui."}>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          returnKeyType="done"
          placeholder="Adicionar item (ex: 1 dz ovos)"
          placeholderTextColor={colors.faint}
          style={[ui.input, { flex: 1 }]}
          maxLength={200}
        />
        <Pressable
          onPress={add}
          accessibilityLabel="Adicionar"
          style={{ width: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="add" size={26} color={colors.primaryText} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : items.length === 0 ? (
        <Card>
          <Muted style={{ textAlign: "center" }}>Lista vazia. Adicione itens acima ou gere um cardápio na Nutrição.</Muted>
        </Card>
      ) : (
        <>
          <Card style={{ gap: 2, paddingVertical: space.sm }}>
            {[...pending, ...done].map((it) => (
              <View key={it.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 10 }}>
                <Pressable onPress={() => toggle(it)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: it.checked }}>
                  <Ionicons name={it.checked ? "checkmark-circle" : "ellipse-outline"} size={24} color={it.checked ? colors.success : colors.muted} />
                </Pressable>
                <Pressable onPress={() => toggle(it)} style={{ flex: 1 }}>
                  <Text style={{ color: it.checked ? colors.faint : colors.text, textDecorationLine: it.checked ? "line-through" : "none" }}>
                    {it.name}
                    {it.quantity ? <Text style={{ color: colors.muted }}> · {it.quantity}</Text> : null}
                  </Text>
                </Pressable>
                <Pressable onPress={() => remove(it)} hitSlop={10} accessibilityLabel={`Remover ${it.name}`}>
                  <Ionicons name="close" size={18} color={colors.faint} />
                </Pressable>
              </View>
            ))}
          </Card>
          {done.length > 0 && <Button title={`Limpar ${done.length} comprados`} variant="ghost" onPress={clearChecked} />}
        </>
      )}
    </Screen>
  );
}
