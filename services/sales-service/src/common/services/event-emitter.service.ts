import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EventEmitterService {
  constructor(
    @Inject('NATS_CLIENT') private readonly client: ClientProxy,
  ) {}

  async emit(pattern: string, data: any): Promise<void> {
    this.client.emit(pattern, data).subscribe({
      error: (err) => {
        console.error(`Error emitting event ${pattern}:`, err);
      },
    });
  }

  async emitContactCreated(tenantId: string, contact: any): Promise<void> {
    await this.emit('contact.created', {
      tenantId,
      contact,
      timestamp: new Date().toISOString(),
    });
  }

  async emitContactUpdated(tenantId: string, contact: any): Promise<void> {
    await this.emit('contact.updated', {
      tenantId,
      contact,
      timestamp: new Date().toISOString(),
    });
  }

  async emitLeadCreated(tenantId: string, lead: any): Promise<void> {
    await this.emit('lead.created', {
      tenantId,
      lead,
      timestamp: new Date().toISOString(),
    });
  }

  async emitLeadConverted(tenantId: string, lead: any, opportunity: any): Promise<void> {
    await this.emit('lead.converted', {
      tenantId,
      lead,
      opportunity,
      timestamp: new Date().toISOString(),
    });
  }

  async emitOpportunityCreated(tenantId: string, opportunity: any): Promise<void> {
    await this.emit('opportunity.created', {
      tenantId,
      opportunity,
      timestamp: new Date().toISOString(),
    });
  }

  async emitOpportunityStageChanged(tenantId: string, opportunity: any, oldStage: string, newStage: string): Promise<void> {
    await this.emit('opportunity.stage.changed', {
      tenantId,
      opportunity,
      oldStage,
      newStage,
      timestamp: new Date().toISOString(),
    });
  }

  async emitOpportunityWon(tenantId: string, opportunity: any): Promise<void> {
    await this.emit('opportunity.won', {
      tenantId,
      opportunity,
      timestamp: new Date().toISOString(),
    });
  }

  async emitOpportunityLost(tenantId: string, opportunity: any, reason: string): Promise<void> {
    await this.emit('opportunity.lost', {
      tenantId,
      opportunity,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}