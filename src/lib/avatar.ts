// Escolher, enviar e salvar a foto de perfil.
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

function base64ToBytes(b64: string): Uint8Array {
  const bin = globalThis.atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function pickAvatar(source: "camera" | "library"): Promise<{ base64: string; mime: string } | null> {
  const perm =
    source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Libere o acesso à câmera ou às fotos nas configurações do celular.");
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true };
  const res = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets?.[0]?.base64) return null;
  const a = res.assets[0];
  return { base64: a.base64!, mime: a.mimeType ?? "image/jpeg" };
}

// Envia para a pasta do usuário (só ele pode gravar nela) e grava o endereço no perfil.
export async function uploadAvatar(userId: string, img: { base64: string; mime: string }): Promise<string> {
  const bytes = base64ToBytes(img.base64);
  if (bytes.length > 5 * 1024 * 1024) throw new Error("Foto muito grande. Escolha outra.");
  const ext = img.mime.includes("png") ? "png" : "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, bytes, { contentType: img.mime, upsert: false });
  if (error) throw new Error("Não foi possível enviar a foto.");
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error: e2 } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", userId);
  if (e2) throw new Error("A foto foi enviada, mas não foi salva no perfil.");
  return data.publicUrl;
}
