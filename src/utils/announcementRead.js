const STORAGE_KEY = "metu_read_announcements";

export function getReadAnnouncementIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function markAnnouncementsRead(ids) {
  const read = getReadAnnouncementIds();
  for (const id of ids) read.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...read]));
  window.dispatchEvent(new CustomEvent("announcements-read"));
}

export function hasUnreadAnnouncements(announcements) {
  const read = getReadAnnouncementIds();
  return announcements.some((a) => a.isActive !== false && !read.has(a.id));
}
