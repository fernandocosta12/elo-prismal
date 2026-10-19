// Lembretes locais (agendados no próprio celular, sem servidor e sem custo).
// Funcionam no app instalado (Expo Go / App Store). No navegador não há lembrete agendado.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export type Time = { h: number; m: number };
export type ReminderSettings = {
  water: { on: boolean; start: number; end: number; every: number };
  meals: { on: boolean; cafe: Time; almoco: Time; lanche: Time; jantar: Time };
  workout: { on: boolean; time: Time };
  weigh: { on: boolean; time: Time }; // semanal, segunda-feira
};

export const DEFAULT_REMINDERS: ReminderSettings = {
  water: { on: false, start: 9, end: 19, every: 2 },
  meals: { on: false, cafe: { h: 7, m: 30 }, almoco: { h: 12, m: 30 }, lanche: { h: 16, m: 0 }, jantar: { h: 19, m: 30 } },
  workout: { on: false, time: { h: 18, m: 0 } },
  weigh: { on: false, time: { h: 7, m: 0 } },
};

const KEY = "ritmo.reminders.v1";
export const remindersSupported = Platform.OS !== "web";

export async function loadReminders(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_REMINDERS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_REMINDERS;
}

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

const daily = (t: Time) => ({ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.h, minute: t.m }) as const;

// Salva e reagenda tudo. Devolve false se a pessoa negou a permissão.
export async function saveReminders(s: ReminderSettings): Promise<boolean> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
  if (!remindersSupported) return true;

  const anyOn = s.water.on || s.meals.on || s.workout.on || s.weigh.on;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!anyOn) return true;

  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted && perm.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lembretes", { name: "Lembretes", importance: Notifications.AndroidImportance.DEFAULT });
  }

  const jobs: Notifications.NotificationRequestInput[] = [];
  if (s.water.on) {
    for (let h = s.water.start; h <= s.water.end; h += s.water.every) {
      jobs.push({ content: { title: "Hora de beber água 💧", body: "Um copo agora ajuda a bater a meta do dia." }, trigger: daily({ h, m: 0 }) });
    }
  }
  if (s.meals.on) {
    const meals: [Time, string][] = [
      [s.meals.cafe, "Café da manhã"],
      [s.meals.almoco, "Almoço"],
      [s.meals.lanche, "Lanche da tarde"],
      [s.meals.jantar, "Jantar"],
    ];
    for (const [t, name] of meals) {
      jobs.push({ content: { title: `${name} 🍽️`, body: "Registre o que comer: tire uma foto ou descreva." }, trigger: daily(t) });
    }
  }
  if (s.workout.on) {
    jobs.push({ content: { title: "Bora treinar? 💪", body: "Seu treino de hoje já está sugerido no app." }, trigger: daily(s.workout.time) });
  }
  if (s.weigh.on) {
    jobs.push({
      content: { title: "Pesagem da semana ⚖️", body: "Em jejum, antes do café. Isso ajusta sua meta de calorias." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: s.weigh.time.h, minute: s.weigh.time.m },
    });
  }
  for (const j of jobs) await Notifications.scheduleNotificationAsync(j);
  return true;
}
