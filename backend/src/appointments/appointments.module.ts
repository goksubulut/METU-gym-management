import { Module } from '@nestjs/common';
import { SlotsModule } from '../slots/slots.module';
import { AppointmentReconciliationService } from './appointment-reconciliation.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [SlotsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentReconciliationService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
