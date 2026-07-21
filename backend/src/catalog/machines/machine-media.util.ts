import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';

/** Disk üzerindeki makine fotoğrafları (ServeStatic /media ile sunulur). */
export const PHOTOS_DIR = join(process.cwd(), 'media', 'photos');

/** Özel QR PNG dosyaları. */
export const QR_DIR = join(process.cwd(), 'media', 'qr');

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function ensurePhotosDir(): void {
  if (!existsSync(PHOTOS_DIR)) {
    mkdirSync(PHOTOS_DIR, { recursive: true });
  }
}

export function ensureQrDir(): void {
  if (!existsSync(QR_DIR)) {
    mkdirSync(QR_DIR, { recursive: true });
  }
}

/** Orijinal dosya adından güvenli uzantı üretir. */
export function safeImageExt(originalName: string): string {
  const ext = extname(originalName).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : '.jpeg';
}

function deleteMediaFile(
  url: string | null | undefined,
  prefix: '/media/photos/' | '/media/qr/',
  dir: string,
): void {
  if (!url || !url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return;
  }
  const full = join(dir, filename);
  if (existsSync(full)) {
    unlinkSync(full);
  }
}

/** photoUrl yolundan disk dosyasını siler (yalnızca /media/photos/ altı). */
export function deletePhotoFile(photoUrl: string | null | undefined): void {
  deleteMediaFile(photoUrl, '/media/photos/', PHOTOS_DIR);
}

/** qrImageUrl yolundan disk dosyasını siler (yalnızca /media/qr/ altı). */
export function deleteQrFile(qrImageUrl: string | null | undefined): void {
  deleteMediaFile(qrImageUrl, '/media/qr/', QR_DIR);
}
