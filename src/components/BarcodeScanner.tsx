// Leitor de código de barras pela câmera (app instalado). No navegador, digita-se o número.
import { useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button, Muted } from "./ui";
import { colors, radius, space } from "@/theme";

export function BarcodeScanner({ onCode }: { onCode: (code: string) => void }) {
  const [perm, requestPerm] = useCameraPermissions();
  const done = useRef(false);
  const [active, setActive] = useState(true);

  if (Platform.OS === "web") return null;
  if (!perm) return null;
  if (!perm.granted) {
    return (
      <View style={{ gap: space.sm }}>
        <Muted>Para ler o código, o app precisa da câmera.</Muted>
        <Button title="Permitir câmera" onPress={requestPerm} />
      </View>
    );
  }
  if (!active) return null;
  return (
    <View style={{ borderRadius: radius.md, overflow: "hidden", height: 260, backgroundColor: "#000" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
        onBarcodeScanned={({ data }) => {
          if (done.current) return;
          done.current = true;
          setActive(false);
          onCode(data);
        }}
      />
      <View pointerEvents="none" style={{ position: "absolute", left: 30, right: 30, top: 105, height: 50, borderWidth: 2, borderColor: colors.primary, borderRadius: 10 }} />
      <Text style={{ position: "absolute", bottom: 10, alignSelf: "center", color: "#fff", fontSize: 13 }}>Aponte para o código de barras</Text>
    </View>
  );
}
