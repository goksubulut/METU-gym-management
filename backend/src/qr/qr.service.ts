import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

export interface QrView {
  /** QR'ın içine gömülen tam URL (deep-link) */
  url: string;
  /** <img src=...> — özel PNG yolu veya üretilmiş data-URL */
  dataUrl: string;
  /** true: admin yüklediği özel PNG kullanılıyor */
  custom: boolean;
}

export interface MachineQrView extends QrView {
  machineId: string;
  machineName: string;
  location: string;
}

/**
 * QR üretimi (FR-QR-1..3). QR'lar machine_id bazlı deep-link URL taşır;
 * fiziksel olarak basılıp makinelere/kapıya yapıştırılır. Üretim admin işidir.
 * Admin özel PNG yüklediyse o gösterilir; yoksa deep-link'ten üretilir.
 */
@Injectable()
export class QrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** FR-QR-2/3: makine QR'ı — okutulunca makine detayına gider (video/arıza/puan). */
  async forMachine(machineId: string): Promise<MachineQrView> {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: {
        id: true,
        name: true,
        location: true,
        qrCode: true,
        qrImageUrl: true,
        isActive: true,
      },
    });
    if (!machine) {
      throw new NotFoundException('Makine bulunamadı');
    }

    // Machine.qrCode deep-link yolunu tutar (ör. "/machine/m1")
    const url = `${this.appBaseUrl()}${machine.qrCode}`;
    const custom = Boolean(machine.qrImageUrl);
    return {
      machineId: machine.id,
      machineName: machine.name,
      location: machine.location,
      url,
      custom,
      dataUrl: custom ? machine.qrImageUrl! : await this.toDataUrl(url),
    };
  }

  /** FR-QR-1: kapı QR'ı — uygulama tanıtım/bilgilendirme sayfasına gider. */
  async forDoor(): Promise<QrView> {
    const url = `${this.appBaseUrl()}/qr-info`;
    return { url, custom: false, dataUrl: await this.toDataUrl(url) };
  }

  private appBaseUrl(): string {
    // Sondaki / temizlenir ki deep-link yolu ile birleşince çift / oluşmasın
    return (this.config.get<string>('APP_BASE_URL') ?? 'http://localhost:5173').replace(/\/+$/, '');
  }

  private toDataUrl(url: string): Promise<string> {
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M', // baskı yıpransa da okunabilsin
      margin: 2,
      width: 512,
      color: { dark: '#151923', light: '#ffffff' },
    });
  }
}
