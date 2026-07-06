import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementCategory, Prisma } from '@prisma/client';
import { formatDateKey } from '../common/utils/ui-mapper.util';
import { PrismaService } from '../prisma/prisma.service';
import { ANNOUNCEMENT_CATEGORY_DEFAULT } from './announcement.constants';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

type AnnouncementRow = Prisma.AnnouncementGetPayload<object>;

export interface AnnouncementView {
  id: string;
  title: string;
  body: string;
  category: 'general' | 'price' | 'event';
  date: string;
  isActive: boolean;
}

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(): Promise<AnnouncementView[]> {
    const rows = await this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  async listAll(): Promise<AnnouncementView[]> {
    const rows = await this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  async create(dto: CreateAnnouncementDto): Promise<AnnouncementView> {
    const row = await this.prisma.announcement.create({
      data: {
        title: dto.title.trim(),
        body: dto.body.trim(),
        category: (dto.category ?? ANNOUNCEMENT_CATEGORY_DEFAULT) as AnnouncementCategory,
        isActive: dto.isActive ?? true,
      },
    });
    return this.toView(row);
  }

  async update(id: string, dto: UpdateAnnouncementDto): Promise<AnnouncementView> {
    await this.assertExists(id);
    const row = await this.prisma.announcement.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        body: dto.body?.trim(),
        category: dto.category as AnnouncementCategory | undefined,
        isActive: dto.isActive,
      },
    });
    return this.toView(row);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    await this.assertExists(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertExists(id: string): Promise<void> {
    const row = await this.prisma.announcement.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Duyuru bulunamadı');
    }
  }

  private toView(row: AnnouncementRow): AnnouncementView {
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      category: this.categoryUi(row.category),
      date: formatDateKey(row.createdAt),
      isActive: row.isActive,
    };
  }

  private categoryUi(category: AnnouncementCategory): AnnouncementView['category'] {
    switch (category) {
      case AnnouncementCategory.PRICE:
        return 'price';
      case AnnouncementCategory.EVENT:
        return 'event';
      default:
        return 'general';
    }
  }
}
