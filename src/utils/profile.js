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
  const match = String(iso).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || !m || !d) return null;
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth() + 1;
  const todayD = now.getDate();
  let age = todayY - y;
  if (todayM < m || (todayM === m && todayD < d)) age -= 1;
  return age >= 0 ? age : null;
}

export function padDatePart(n) {
  return String(n).padStart(2, "0");
}

export function splitBirthDate(iso) {
  const match = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { year: "", month: "", day: "" };
  return { year: match[1], month: match[2], day: match[3] };
}

export function joinBirthDate(year, month, day) {
  if (!year || !month || !day) return "";
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

export function daysInMonth(month, year) {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y) return 31;
  return new Date(y, m, 0).getDate();
}

export function formatWeightKg(kg) {
  if (kg == null || kg === "") return null;
  const n = Number(kg);
  if (Number.isNaN(n)) return null;
  return Number.isInteger(n) ? `${n} kg` : `${n.toFixed(1)} kg`;
}

export function profileDetailLine(profile) {
  if (!profile) return "";
  const age = ageFromBirthDate(profile.birthDate);
  return [
    profile.gender && profile.gender !== "UNSPECIFIED" ? GENDER_LABELS[profile.gender] : null,
    age != null ? `${age} yaş` : null,
    profile.heightCm != null ? `${profile.heightCm} cm` : null,
    formatWeightKg(profile.weightKg),
  ]
    .filter(Boolean)
    .join(" · ");
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
