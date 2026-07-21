import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { ensurePhotosDir, ensureQrDir, PHOTOS_DIR, QR_DIR, safeImageExt } from './machine-media.util';
import { AdminMachineListItem, MachinesService } from './machines.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/machines')
export class AdminMachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm makineler (aktif + pasif) — envanter' })
  listAll(): Promise<AdminMachineListItem[]> {
    return this.machinesService.findAllAdmin();
  }

  @Post()
  @ApiOperation({ summary: 'Yeni makine ekle' })
  create(@Body() dto: CreateMachineDto): Promise<AdminMachineListItem> {
    return this.machinesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Makineyi güncelle (ad, konum, kaslar, fotoUrl hariç)' })
  update(@Param('id') id: string, @Body() dto: UpdateMachineDto): Promise<AdminMachineListItem> {
    return this.machinesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Makineyi pasife al (soft-delete)' })
  remove(@Param('id') id: string) {
    return this.machinesService.softDelete(id);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Makine fotoğrafı yükle / değiştir' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            ensurePhotosDir();
            cb(null, PHOTOS_DIR);
          } catch (err) {
            cb(err as Error, PHOTOS_DIR);
          }
        },
        filename: (req, file, cb) => {
          const ext = safeImageExt(file.originalname);
          cb(null, `${req.params.id}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
          cb(new BadRequestException('Sadece JPEG, PNG veya WebP yüklenebilir') as unknown as Error, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AdminMachineListItem> {
    return this.machinesService.uploadPhoto(id, file);
  }

  @Delete(':id/photo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Makine fotoğrafını sil' })
  deletePhoto(@Param('id') id: string): Promise<AdminMachineListItem> {
    return this.machinesService.deletePhoto(id);
  }

  @Post(':id/qr')
  @ApiOperation({ summary: 'Özel QR PNG yükle / değiştir' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['qr'],
      properties: {
        qr: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('qr', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            ensureQrDir();
            cb(null, QR_DIR);
          } catch (err) {
            cb(err as Error, QR_DIR);
          }
        },
        filename: (req, _file, cb) => {
          cb(null, `${req.params.id}.png`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/png$/i.test(file.mimetype)) {
          cb(new BadRequestException('QR için yalnızca PNG yüklenebilir') as unknown as Error, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadQr(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AdminMachineListItem> {
    return this.machinesService.uploadQrImage(id, file);
  }

  @Delete(':id/qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Özel QR PNG\'yi sil (otomatik üretime dön)' })
  deleteQr(@Param('id') id: string): Promise<AdminMachineListItem> {
    return this.machinesService.deleteQrImage(id);
  }
}
