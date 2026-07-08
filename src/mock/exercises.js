/** Backend kapalıyken egzersiz listelerinde gösterilecek örnek kayıtlar. */
export const MOCK_EXERCISES = [
  {
    id: "mock-ex-1",
    name: "Şınav",
    type: "FREE",
    muscles: ["chest", "arms", "core"],
    instructions: "Eller omuz genişliğinde, vücut düz bir çizgide; göğsü yere yaklaştırıp it.",
  },
  {
    id: "mock-ex-2",
    name: "Goblet Squat",
    type: "FREE",
    muscles: ["legs", "glutes", "core"],
    instructions: "Dambılı göğüste tut, topuklar yerde, kalçayı geriye vererek çök.",
  },
];

/** Makine alternatifleri ekranı için kas grubuna göre filtrelenmiş mock. */
export function mockAlternativeExercises(muscleGroups) {
  const matched = MOCK_EXERCISES.filter((e) => e.muscles.some((g) => muscleGroups.includes(g)));
  return (matched.length > 0 ? matched : MOCK_EXERCISES).slice(0, 2);
}
