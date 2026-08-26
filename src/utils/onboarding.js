// METU MOTION onboarding akışının kalıcı durumu.
// Splash → Cinsiyet → Doğum Tarihi → Kayıt Ol → Dashboard
//
// Hedef kas seçimi bu akıştan çıkarıldı: uygulamada zaten /muscle-groups
// (Kas Haritası) ekranı bu işi yapıyor, onboarding'de tekrarlamak gereksizdi.
//
// Cevaplar localStorage'da tutulur; kullanıcı akışı yarıda bırakıp dönerse
// kaldığı yerden devam eder. Kayıt adımında gender + birthDate API'ye gider.

const KEY = "metu-motion-onboarding";

export const ONBOARDING_STEPS = ["/", "/onboarding/gender", "/onboarding/birthday", "/onboarding/register"];
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
