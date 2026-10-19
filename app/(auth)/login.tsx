import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase, WEB_APP_URL } from "@/lib/supabase";
import { Button, Field, Muted } from "@/components/ui";
import { colors, space } from "@/theme";

type Mode = "entrar" | "criar";

function traduzErro(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Este e-mail já tem conta. Toque em Entrar.";
  if (/Password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/Email not confirmed/i.test(msg)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Aguarde alguns minutos.";
  return msg;
}

export default function Login() {
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !password) return Alert.alert("Preencha e-mail e senha");
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: e, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email: e, password, options: { emailRedirectTo: WEB_APP_URL } });
        if (error) throw error;
        if (!data.session) {
          Alert.alert("Quase lá!", "Enviamos um link de confirmação para o seu e-mail. Toque no link para ativar sua conta e entrar.");
          setMode("entrar");
        }
      }
    } catch (err: any) {
      Alert.alert("Não deu certo", traduzErro(err?.message ?? "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const esqueciSenha = async () => {
    const e = email.trim().toLowerCase();
    if (!e) return Alert.alert("Digite seu e-mail primeiro");
    const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: `${WEB_APP_URL}nova-senha` });
    Alert.alert(
      error ? "Não deu certo" : "E-mail enviado",
      error ? traduzErro(error.message) : "Se existir uma conta com esse e-mail, você vai receber um link para criar uma nova senha."
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: space.xl, gap: space.lg }}>
          <View style={{ alignItems: "center", gap: space.sm, marginBottom: space.xl }}>
            <Text style={{ color: colors.text, fontSize: 40, fontWeight: "800", letterSpacing: -1 }}>
              Rit<Text style={{ color: colors.primary }}>mo</Text>
            </Text>
            <Muted>Sua rotina saudável, um dia de cada vez.</Muted>
          </View>

          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="voce@email.com"
          />
          <Field
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            textContentType={mode === "entrar" ? "password" : "newPassword"}
            placeholder="Mínimo 6 caracteres"
          />

          <Button title={mode === "entrar" ? "Entrar" : "Criar conta"} onPress={submit} loading={loading} />

          {mode === "entrar" && <Button title="Esqueci minha senha" variant="ghost" onPress={esqueciSenha} />}

          <Pressable onPress={() => setMode(mode === "entrar" ? "criar" : "entrar")} style={{ alignItems: "center", padding: space.md }}>
            <Text style={{ color: colors.muted }}>
              {mode === "entrar" ? "Ainda não tem conta? " : "Já tem conta? "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>{mode === "entrar" ? "Criar conta" : "Entrar"}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
