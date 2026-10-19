// Criar nova senha (aberta pelo link do e-mail "Esqueci minha senha")
import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Screen } from "@/components/Screen";
import { Button, Field, Muted } from "@/components/ui";

export default function NovaSenha() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (pass.length < 6) return Alert.alert("Senha curta", "Use pelo menos 6 caracteres.");
    if (pass !== pass2) return Alert.alert("As senhas não conferem", "Digite a mesma senha nos dois campos.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) return Alert.alert("Não deu certo", "O link pode ter expirado. Peça um novo em \"Esqueci minha senha\".");
    Alert.alert("Senha alterada", "Pronto! Use a nova senha nas próximas vezes.");
    router.replace("/");
  };

  return (
    <Screen title="Nova senha" subtitle="Escolha uma senha nova para a sua conta.">
      <Field label="Nova senha" value={pass} onChangeText={setPass} secureTextEntry autoComplete="new-password" />
      <Field label="Repita a nova senha" value={pass2} onChangeText={setPass2} secureTextEntry autoComplete="new-password" />
      <Button title="Salvar nova senha" onPress={save} loading={busy} />
      <Muted style={{ fontSize: 12 }}>Mínimo de 6 caracteres.</Muted>
    </Screen>
  );
}
