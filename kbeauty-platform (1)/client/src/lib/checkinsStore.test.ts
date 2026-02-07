import { describe, it, expect } from "vitest";
import { getStreak } from "./checkinsStore";

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe("checkins streak", () => {
  it("counts consecutive days", () => {
    const logs = [addDays(0), addDays(1), addDays(2)].map((iso) => ({ mood: "great", date: iso }));
    localStorage.setItem("pet:moodLogs", JSON.stringify(logs));
    expect(getStreak()).toBe(3);
  });
});

