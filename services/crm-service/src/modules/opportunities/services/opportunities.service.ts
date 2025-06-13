import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { UpdateOpportunityDto } from '../dto/update-opportunity.dto';
import { EventEmitterService } from '../../../common/services/event-emitter.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunitiesRepository: Repository<Opportunity>,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(tenantId: string, createOpportunityDto: CreateOpportunityDto, userId: string): Promise<Opportunity> {
    const opportunity = this.opportunitiesRepository.create({
      ...createOpportunityDto,
      tenantId,
      createdById: userId,
    });

    const savedOpportunity = await this.opportunitiesRepository.save(opportunity);

    // Emit event
    await this.eventEmitter.emit('opportunity.created', {
      tenantId,
      opportunityId: savedOpportunity.id,
      contactId: savedOpportunity.contactId,
      value: savedOpportunity.value,
      userId,
    });

    return savedOpportunity;
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Opportunity[]; total: number }> {
    const query = this.opportunitiesRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.contact', 'contact')
      .where('opportunity.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        '(opportunity.name ILIKE :search OR contact.firstName ILIKE :search OR contact.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('opportunity.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id, tenantId },
      relations: ['contact'],
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return opportunity;
  }

  async update(tenantId: string, id: string, updateOpportunityDto: UpdateOpportunityDto, userId: string): Promise<Opportunity> {
    const opportunity = await this.findOne(tenantId, id);
    
    Object.assign(opportunity, updateOpportunityDto);
    const updatedOpportunity = await this.opportunitiesRepository.save(opportunity);

    // Emit event
    await this.eventEmitter.emit('opportunity.updated', {
      tenantId,
      opportunityId: id,
      changes: updateOpportunityDto,
      userId,
    });

    return updatedOpportunity;
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const opportunity = await this.findOne(tenantId, id);
    await this.opportunitiesRepository.remove(opportunity);

    // Emit event
    await this.eventEmitter.emit('opportunity.deleted', {
      tenantId,
      opportunityId: id,
      userId,
    });
  }

  async updateStage(tenantId: string, id: string, stage: string, userId: string): Promise<Opportunity> {
    const opportunity = await this.findOne(tenantId, id);
    
    const oldStage = opportunity.stage;
    opportunity.stage = stage;
    
    // Update probability based on stage
    const stageProbabilities = {
      'prospecting': 10,
      'qualification': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed-won': 100,
      'closed-lost': 0,
    };
    
    opportunity.probability = stageProbabilities[stage] || opportunity.probability;
    
    const updatedOpportunity = await this.opportunitiesRepository.save(opportunity);

    // Emit event
    await this.eventEmitter.emit('opportunity.stage.changed', {
      tenantId,
      opportunityId: id,
      oldStage,
      newStage: stage,
      userId,
    });

    return updatedOpportunity;
  }

  async getPipelineMetrics(tenantId: string): Promise<any> {
    const opportunities = await this.opportunitiesRepository.find({
      where: { tenantId },
    });

    const metrics = {
      totalValue: 0,
      totalCount: opportunities.length,
      stageBreakdown: {},
      averageValue: 0,
      winRate: 0,
    };

    const stageGroups = opportunities.reduce((acc, opp) => {
      if (!acc[opp.stage]) {
        acc[opp.stage] = { count: 0, value: 0 };
      }
      acc[opp.stage].count++;
      acc[opp.stage].value += Number(opp.value);
      return acc;
    }, {});

    metrics.stageBreakdown = stageGroups;
    metrics.totalValue = opportunities.reduce((sum, opp) => sum + Number(opp.value), 0);
    metrics.averageValue = metrics.totalCount > 0 ? metrics.totalValue / metrics.totalCount : 0;

    const closedWon = opportunities.filter(opp => opp.stage === 'closed-won').length;
    const closedTotal = opportunities.filter(opp => opp.stage.startsWith('closed')).length;
    metrics.winRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

    return metrics;
  }
}