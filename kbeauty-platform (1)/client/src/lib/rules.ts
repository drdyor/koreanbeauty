type Mood = "great" | "okay" | "meh" | "brainfog" | "irritable" | "low";

export function getMicroTip(input: { mood?: Mood; food?: string }) {
  const tips: string[] = [];
  const recommend: string[] = [];
  const avoid: string[] = [];

  if (input.mood === "irritable" || input.mood === "brainfog") {
    tips.push("Try a calming centella serum");
    recommend.push("centella", "green-tea");
  }
  if (input.food) {
    const f = input.food.toLowerCase();
    if (f.includes("spicy") || f.includes("burger") || f.includes("chocolate")) {
      tips.push("Balance with gentle BHA/tea tree");
      recommend.push("salicylic-acid", "tea-tree");
    }
    if (f.includes("milk")) {
      tips.push("Soothe with barrier-repair toner");
      recommend.push("ceramides", "panthenol");
    }
    if (f.includes("wine")) {
      tips.push("Hydrate extra tonight");
      recommend.push("hyaluronic-acid");
    }
  }

  const message = tips[0] || "Logged! Keep glowing ✨";
  return { message, recommend, avoid };
}

