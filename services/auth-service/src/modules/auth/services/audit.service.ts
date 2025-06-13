import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditLogData {
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(auditLog);
  }

  async findByTenant(
    tenantId: string,
    page = 1,
    limit = 50,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ data: AuditLog[]; total: number }> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId });

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.resource) {
      query.andWhere('audit.resource = :resource', { resource: filters.resource });
    }

    if (filters?.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('audit.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findByResource(
    tenantId: string,
    resource: string,
    resourceId: string
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
        resource,
        resourceId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getActivitySummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.tenantId = :tenantId', { tenantId })
      .andWhere('audit.createdAt >= :startDate', { startDate })
      .andWhere('audit.createdAt <= :endDate', { endDate })
      .groupBy('audit.action');

    const actionSummary = await query.getRawMany();

    const resourceQuery = this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .where('audit.tenantId = :tenantId', { tenantId })
      .andWhere('audit.createdAt >= :startDate', { startDate })
      .andWhere('audit.createdAt <= :endDate', { endDate })
      .groupBy('audit.resource');

    const resourceSummary = await resourceQuery.getRawMany();

    return {
      actionSummary,
      resourceSummary,
      totalActivities: actionSummary.reduce((sum, item) => sum + parseInt(item.count), 0),
    };
  }
}