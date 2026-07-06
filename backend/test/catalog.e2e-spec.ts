import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

/**
 * Katalog + öneri motoru. Uçlar @Public olduğundan token gerekmez (FR-CAT-1).
 * Seed verisine dayanır (25 makine, 8 kas grubu, 39 egzersiz).
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
      expect(res.body.data.length).toBeGreaterThanOrEqual(25);
      const m = res.body.data.find((x: { id: string }) => x.id === 'm1');
      expect(m.name).toBe('Koşu Bandı');
      expect(m).toHaveProperty('rating');
      expect(m).toHaveProperty('openFaults');
      expect(m.muscleGroups.map((g: { id: string }) => g.id)).toContain('legs');
      // Hibrit öneri: ince hedef kas etiketi de dönmeli
      expect(Array.isArray(m.targetMuscles)).toBe(true);
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
      // Göğüs grubundaki makineler: Incline Chest Press, Chest Press, Pec Fly & Rear Delt
      expect(ids).toEqual(expect.arrayContaining(['m18', 'm19', 'm20']));
    });
  });

  describe('GET /api/machines/:id', () => {
    it('detay video ve QR bilgisiyle döner (FR-QR-2)', async () => {
      // m13 (Leg Press) videolu bir makine
      const res = await request(app.getHttpServer()).get('/api/machines/m13').expect(200);
      expect(res.body.data.videos.length).toBeGreaterThan(0);
      expect(res.body.data.qrCode).toBe('/machine/m13');
      expect(res.body.data.tips).toBeTruthy();
    });

    it('olmayan makine 404 döner', async () => {
      await request(app.getHttpServer()).get('/api/machines/yok-boyle-makine').expect(404);
    });
  });

  describe('GET /api/machines/:id/alternatives — öneri motoru', () => {
    it('aynı kas grubunu çalıştıran makine ve egzersizleri döner (FR-RC-1)', async () => {
      // m22 = Biceps Curl (arms / biceps). Hibrit motor biceps hedefli makineleri öne alır.
      const res = await request(app.getHttpServer()).get('/api/machines/m22/alternatives').expect(200);
      const { machine, alternativeMachines, alternativeExercises } = res.body.data;

      expect(machine.id).toBe('m22');
      // Kendisi listede olmamalı
      expect(alternativeMachines.some((m: { id: string }) => m.id === 'm22')).toBe(false);
      // Her alternatif en az bir ortak kas grubu paylaşmalı
      expect(
        alternativeMachines.every((m: { sharedMuscleGroups: string[] }) => m.sharedMuscleGroups.length > 0),
      ).toBe(true);
      // Hibrit sıralama: Preacher Curl (m24, biceps) triceps makinesi (m23) önünde gelmeli
      const preacherIndex = alternativeMachines.findIndex((m: { id: string }) => m.id === 'm24');
      const tricepsIndex = alternativeMachines.findIndex((m: { id: string }) => m.id === 'm23');
      expect(preacherIndex).toBeGreaterThanOrEqual(0);
      expect(tricepsIndex).toBeGreaterThanOrEqual(0);
      expect(preacherIndex).toBeLessThan(tricepsIndex);
      // Preacher Curl ince hedef kası 'biceps' örtüşmesine sahip olmalı
      const preacher = alternativeMachines[preacherIndex];
      expect(preacher.sharedTargets).toContain('biceps');
      // Egzersiz alternatifi var ve ısınma/soğuma içermiyor
      expect(alternativeExercises.length).toBeGreaterThan(0);
      expect(alternativeExercises.every((e: { type: string }) => ['FREE', 'MACHINE'].includes(e.type))).toBe(true);
    });

    it('kardiyo makinesi dolunca yalnızca kardiyo makineleri önerir', async () => {
      // m1 = Koşu Bandı (kardiyo). Kuvvet makineleri (leg press vb.) listeye girmemeli.
      const res = await request(app.getHttpServer()).get('/api/machines/m1/alternatives').expect(200);
      const alts = res.body.data.alternativeMachines;
      expect(alts.length).toBeGreaterThan(0);
      expect(
        alts.every((m: { muscleGroups: { id: string }[] }) =>
          m.muscleGroups.some((g) => g.id === 'cardio'),
        ),
      ).toBe(true);
    });

    it('birebir hedef muadili olmayan makinede noDirectMatch=true döner', async () => {
      // m15 = Adductor & Abductor; adductors/abductors hedefini paylaşan başka makine yok.
      const res = await request(app.getHttpServer()).get('/api/machines/m15/alternatives').expect(200);
      expect(res.body.data.noDirectMatch).toBe(true);
      expect(
        res.body.data.alternativeMachines.every(
          (m: { sharedTargets: string[] }) => m.sharedTargets.length === 0,
        ),
      ).toBe(true);
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
      // Bacak grubundaki makineler: Koşu Bandı (m1), Kıvrık Deadlift (m7), Leg Press (m13)
      expect(machines.map((m: { id: string }) => m.id)).toEqual(expect.arrayContaining(['m1', 'm7', 'm13']));
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
