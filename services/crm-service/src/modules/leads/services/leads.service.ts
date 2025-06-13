import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { EventEmitterService } from '../../../common/services/event-emitter.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(tenantId: string, createLeadDto: CreateLeadDto, userId: string): Promise<Lead> {
    const lead = this.leadsRepository.create({
      ...createLeadDto,
      tenantId,
      createdById: userId,
    });

    const savedLead = await this.leadsRepository.save(lead);

    // Emit event
    await this.eventEmitter.emit('lead.created', {
      tenantId,
      leadId: savedLead.id,
      contactId: savedLead.contactId,
      userId,
    });

    return savedLead;
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Lead[]; total: number }> {
    const query = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .where('lead.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('lead.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id, tenantId },
      relations: ['contact'],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(tenantId: string, id: string, updateLeadDto: UpdateLeadDto, userId: string): Promise<Lead> {
    const lead = await this.findOne(tenantId, id);
    
    Object.assign(lead, updateLeadDto);
    const updatedLead = await this.leadsRepository.save(lead);

    // Emit event
    await this.eventEmitter.emit('lead.updated', {
      tenantId,
      leadId: id,
      changes: updateLeadDto,
      userId,
    });

    return updatedLead;
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const lead = await this.findOne(tenantId, id);
    await this.leadsRepository.remove(lead);

    // Emit event
    await this.eventEmitter.emit('lead.deleted', {
      tenantId,
      leadId: id,
      userId,
    });
  }

  async convertToOpportunity(tenantId: string, id: string, userId: string): Promise<void> {
    const lead = await this.findOne(tenantId, id);
    
    lead.status = 'converted';
    await this.leadsRepository.save(lead);

    // Emit event for opportunity creation
    await this.eventEmitter.emit('lead.converted', {
      tenantId,
      leadId: id,
      contactId: lead.contactId,
      userId,
    });
  }
}