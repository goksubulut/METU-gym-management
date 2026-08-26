// METU MOTION onboarding akışının kalıcı durumu.
// Splash → Cinsiyet → Doğum Tarihi → Hedef Kas → Dashboard
//
// Cevaplar localStorage'da tutulur; kullanıcı akışı yarıda bırakıp dönerse
// kaldığı yerden devam eder. Backend'e gönderim Part 6'da profil ucuna bağlanır.

const KEY = "metu-motion-onboarding";

export const ONBOARDING_STEPS = ["/", "/onboarding/gender", "/onboarding/birthday", "/onboarding/target-muscle"];
export const ONBOARDING_TOTAL = ONBOARDING_STEPS.length;

export function readOnboarding() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveOnboarding(patch) {
  try {
    const next = { ...readOnboarding(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return readOnboarding();
  }
}

export function isOnboardingDone() {
  return readOnboarding().completed === true;
}

export function completeOnboarding() {
  return saveOnboarding({ completed: true, completedAt: new Date().toISOString() });
}
