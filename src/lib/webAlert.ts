// No navegador, o Alert do React Native não mostra nada.
// Aqui ele passa a usar as caixas de aviso/confirmação do próprio navegador.
import { Alert, Platform, type AlertButton } from "react-native";

if (Platform.OS === "web" && typeof window !== "undefined") {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join("\n\n");
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find((b) => b.style === "cancel");
    const action = buttons.filter((b) => b !== cancel).slice(-1)[0];
    if (window.confirm(text)) action?.onPress?.();
    else cancel?.onPress?.();
  };
}
