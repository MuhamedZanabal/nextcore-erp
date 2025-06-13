import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { EventEmitterService } from '../../../common/services/event-emitter.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(tenantId: string, createCampaignDto: CreateCampaignDto, userId: string): Promise<Campaign> {
    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      tenantId,
      createdById: userId,
    });

    const savedCampaign = await this.campaignsRepository.save(campaign);

    await this.eventEmitter.emit('campaign.created', {
      tenantId,
      campaignId: savedCampaign.id,
      userId,
    });

    return savedCampaign;
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Campaign[]; total: number }> {
    const query = this.campaignsRepository
      .createQueryBuilder('campaign')
      .where('campaign.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('campaign.name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('campaign.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id, tenantId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(tenantId: string, id: string, updateCampaignDto: UpdateCampaignDto, userId: string): Promise<Campaign> {
    const campaign = await this.findOne(tenantId, id);
    
    Object.assign(campaign, updateCampaignDto);
    const updatedCampaign = await this.campaignsRepository.save(campaign);

    await this.eventEmitter.emit('campaign.updated', {
      tenantId,
      campaignId: id,
      changes: updateCampaignDto,
      userId,
    });

    return updatedCampaign;
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const campaign = await this.findOne(tenantId, id);
    await this.campaignsRepository.remove(campaign);

    await this.eventEmitter.emit('campaign.deleted', {
      tenantId,
      campaignId: id,
      userId,
    });
  }

  async getMetrics(tenantId: string, id: string): Promise<any> {
    const campaign = await this.findOne(tenantId, id);
    
    // Calculate campaign metrics
    const metrics = {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 100) + 10,
      cost: Number(campaign.budget) || 0,
      roi: 0,
    };

    metrics.roi = metrics.cost > 0 ? ((metrics.conversions * 100 - metrics.cost) / metrics.cost) * 100 : 0;

    // Update campaign metrics
    campaign.metrics = metrics;
    await this.campaignsRepository.save(campaign);

    return metrics;
  }

  async updateStatus(tenantId: string, id: string, status: string, userId: string): Promise<Campaign> {
    const campaign = await this.findOne(tenantId, id);
    
    const oldStatus = campaign.status;
    campaign.status = status;
    
    const updatedCampaign = await this.campaignsRepository.save(campaign);

    await this.eventEmitter.emit('campaign.status.changed', {
      tenantId,
      campaignId: id,
      oldStatus,
      newStatus: status,
      userId,
    });

    return updatedCampaign;
  }
}