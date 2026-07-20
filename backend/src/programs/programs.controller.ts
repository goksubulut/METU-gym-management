import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import {
  ProgramDetailView,
  ProgramSummaryView,
  ProgramsService,
} from './programs.service';

@ApiTags('programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Antrenman programlarım' })
  findMine(@CurrentUser() user: AccessTokenPayload): Promise<ProgramSummaryView[]> {
    return this.programsService.findMine(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni antrenman programı oluştur' })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateProgramDto,
  ): Promise<ProgramDetailView> {
    return this.programsService.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Program detayı' })
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
  ): Promise<ProgramDetailView> {
    return this.programsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Program adı veya öğe listesini güncelle' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ): Promise<ProgramDetailView> {
    return this.programsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Programı sil' })
  remove(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<void> {
    return this.programsService.remove(user.sub, id);
  }
}
