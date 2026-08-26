export const GENDER_LABELS = {
  MALE: "Erkek",
  FEMALE: "Kadın",
  UNSPECIFIED: "Belirtilmedi",
};

const ONBOARDING_GENDER_TO_API = {
  Erkek: "MALE",
  Kadın: "FEMALE",
  "Belirtmek İstemiyorum": "UNSPECIFIED",
};

export function ageFromBirthDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const month = today.getMonth() + 1;
  if (month < m || (month === m && today.getDate() < d)) age -= 1;
  return age >= 0 ? age : null;
}

export function onboardingToRegisterPayload(saved) {
  const gender = ONBOARDING_GENDER_TO_API[saved?.gender] ?? undefined;
  const b = saved?.birthday;
  const birthDate =
    b?.year && b?.month && b?.day
      ? `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")}`
      : undefined;
  return { gender, birthDate };
}
