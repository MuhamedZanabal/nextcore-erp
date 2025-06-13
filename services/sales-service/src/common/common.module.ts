import { Module } from '@nestjs/common';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AuthGuard } from './guards/auth.guard';
import { TenantGuard } from './guards/tenant.guard';
import { EventEmitterService } from './services/event-emitter.service';

@Module({
  providers: [
    AuthGuard,
    TenantGuard,
    EventEmitterService,
  ],
  exports: [
    AuthGuard,
    TenantGuard,
    EventEmitterService,
  ],
})
export class CommonModule {}