type MoodName = "great" | "okay" | "meh" | "brainfog" | "irritable" | "low";

type FoodLog = { food: string; intensity: number; date: string };
type MoodLog = { mood: MoodName; date: string };

const LS_MOOD_KEY = "pet:moodLogs";
const LS_FOOD_KEY = "pet:foodLogs";

export const addMoodLog = (mood: MoodName) => {
  const entry: MoodLog = { mood, date: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(LS_MOOD_KEY);
    const arr = raw ? (JSON.parse(raw) as MoodLog[]) : [];
    arr.push(entry);
    localStorage.setItem(LS_MOOD_KEY, JSON.stringify(arr));
  } catch {}
};

export const addFoodLog = (food: string, intensity: number) => {
  const entry: FoodLog = { food, intensity, date: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(LS_FOOD_KEY);
    const arr = raw ? (JSON.parse(raw) as FoodLog[]) : [];
    arr.push(entry);
    localStorage.setItem(LS_FOOD_KEY, JSON.stringify(arr));
  } catch {}
};

export const getLastCheckIn = (): Date | undefined => {
  try {
    const rawMood = localStorage.getItem(LS_MOOD_KEY);
    const rawFood = localStorage.getItem(LS_FOOD_KEY);
    const lastMood = rawMood ? (JSON.parse(rawMood) as MoodLog[]).at(-1) : undefined;
    const lastFood = rawFood ? (JSON.parse(rawFood) as FoodLog[]).at(-1) : undefined;
    const latest = [lastMood?.date, lastFood?.date].filter(Boolean).sort();
    const iso = latest.at(-1);
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
};

export const getMoodLogs = (): MoodLog[] => {
  try {
    const raw = localStorage.getItem(LS_MOOD_KEY);
    return raw ? (JSON.parse(raw) as MoodLog[]) : [];
  } catch {
    return [];
  }
};

export const getStreak = (): number => {
  const logs = getMoodLogs();
  if (logs.length === 0) return 0;
  // Count consecutive days from today backwards with at least one log per day
  const days = new Set<string>();
  logs.forEach(l => days.add(new Date(l.date).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toDateString();
    if (days.has(key)) streak++; else break;
  }
  return streak;
};
