import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Faltam EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY no arquivo .env");
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No navegador, os links do e-mail (confirmar conta, nova senha) voltam com o login na URL
    detectSessionInUrl: Platform.OS === "web",
  },
});

// Só renova o login enquanto o app está aberto na tela (recomendação do Supabase para apps móveis)
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

// Endereço do app para onde os links dos e-mails levam
export const WEB_APP_URL = "https://fernandocosta12.github.io/elo-prismal/ritmo/";
