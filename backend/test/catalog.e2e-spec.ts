import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

/**
 * Katalog + öneri motoru. Uçlar @Public olduğundan token gerekmez (FR-CAT-1).
 * Seed verisine dayanır (12 makine, 8 kas grubu, 35 egzersiz).
 */
describe('Catalog (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/machines', () => {
    it('token olmadan makine listesini döner (FR-CAT-1)', async () => {
      const res = await request(app.getHttpServer()).get('/api/machines').expect(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(12);
      const m = res.body.data.find((x: { id: string }) => x.id === 'm1');
      expect(m.name).toBe('Leg Press 45°');
      expect(m).toHaveProperty('rating');
      expect(m).toHaveProperty('openFaults');
      expect(m.muscleGroups.map((g: { id: string }) => g.id)).toContain('legs');
    });

    it('kategori filtresi çalışır', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/machines?category=Kardiyo')
        .expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((m: { category: string }) => m.category === 'Kardiyo')).toBe(true);
    });

    it('geçersiz kategoriyi 400 ile reddeder', async () => {
      await request(app.getHttpServer()).get('/api/machines?category=Uzay').expect(400);
    });

    it('kas grubu filtresi çalışır (FR-CAT-3)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/machines?muscleGroup=chest')
        .expect(200);
      const ids = res.body.data.map((m: { id: string }) => m.id);
      expect(ids).toEqual(expect.arrayContaining(['m3', 'm5', 'm6']));
    });
  });

  describe('GET /api/machines/:id', () => {
    it('detay video ve QR bilgisiyle döner (FR-QR-2)', async () => {
      const res = await request(app.getHttpServer()).get('/api/machines/m1').expect(200);
      expect(res.body.data.videos.length).toBeGreaterThan(0);
      expect(res.body.data.qrCode).toBe('/machine/m1');
      expect(res.body.data.tips).toBeTruthy();
    });

    it('olmayan makine 404 döner', async () => {
      await request(app.getHttpServer()).get('/api/machines/yok-boyle-makine').expect(404);
    });
  });

  describe('GET /api/machines/:id/alternatives — öneri motoru', () => {
    it('aynı kas grubunu çalıştıran makine ve egzersizleri döner (FR-RC-1)', async () => {
      const res = await request(app.getHttpServer()).get('/api/machines/m1/alternatives').expect(200);
      const { machine, alternativeMachines, alternativeExercises } = res.body.data;

      expect(machine.id).toBe('m1');
      // Kendisi listede olmamalı
      expect(alternativeMachines.some((m: { id: string }) => m.id === 'm1')).toBe(false);
      // Her alternatif en az bir ortak kas grubu paylaşmalı
      expect(
        alternativeMachines.every((m: { sharedMuscleGroups: string[] }) => m.sharedMuscleGroups.length > 0),
      ).toBe(true);
      // m7 (Squat Rack: legs+glutes+core) m1 (legs+glutes) ile 2 grup paylaşır → üst sıralarda
      const m7Index = alternativeMachines.findIndex((m: { id: string }) => m.id === 'm7');
      expect(m7Index).toBeGreaterThanOrEqual(0);
      expect(m7Index).toBeLessThan(3);
      // Egzersiz alternatifi var ve ısınma/soğuma içermiyor
      expect(alternativeExercises.length).toBeGreaterThan(0);
      expect(alternativeExercises.every((e: { type: string }) => ['FREE', 'MACHINE'].includes(e.type))).toBe(true);
    });

    it('slotId verilirse plannedCount alanı döner (FR-RC-4)', async () => {
      // Seed'deki bugünkü randevular slotlara bağlı; herhangi bir slot id yeterli
      const anySlot = await request(app.getHttpServer()).get('/api/machines/m3/alternatives?slotId=olmayan-slot');
      expect(anySlot.status).toBe(200);
      expect(anySlot.body.data.alternativeMachines[0]).toHaveProperty('plannedCount');
    });
  });

  describe('GET /api/muscle-groups', () => {
    it('8 kas grubunu harita slug eşlemesiyle döner (FR-CAT-2)', async () => {
      const res = await request(app.getHttpServer()).get('/api/muscle-groups').expect(200);
      expect(res.body.data).toHaveLength(8);
      const arms = res.body.data.find((g: { id: string }) => g.id === 'arms');
      expect(arms.svgRegionCode).toBe('biceps,triceps,forearm');
      expect(arms.machineCount).toBeGreaterThan(0);
    });

    it('detay: makineler + tipe göre gruplu egzersizler (FR-CAT-3, FR-WU-1)', async () => {
      const res = await request(app.getHttpServer()).get('/api/muscle-groups/legs').expect(200);
      const { machines, exercises } = res.body.data;
      expect(machines.map((m: { id: string }) => m.id)).toEqual(expect.arrayContaining(['m1', 'm7', 'm9']));
      expect(exercises.warmup.length).toBeGreaterThan(0);
      expect(exercises.cooldown.length).toBeGreaterThan(0);
      expect(exercises.free.length).toBeGreaterThan(0);
    });

    it('olmayan kas grubu 404 döner', async () => {
      await request(app.getHttpServer()).get('/api/muscle-groups/tail').expect(404);
    });
  });

  describe('GET /api/exercises', () => {
    it('tip + kas grubu filtresiyle ısınma hareketlerini döner (FR-WU-1)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/exercises?type=WARMUP&muscleGroup=legs')
        .expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((e: { type: string }) => e.type === 'WARMUP')).toBe(true);
    });

    it('geçersiz tipi 400 ile reddeder', async () => {
      await request(app.getHttpServer()).get('/api/exercises?type=YOGA').expect(400);
    });
  });
});
