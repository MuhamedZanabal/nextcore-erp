import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { EventEmitterService } from '../../../common/services/event-emitter.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(tenantId: string, createActivityDto: CreateActivityDto, userId: string): Promise<Activity> {
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      tenantId,
      createdById: userId,
    });

    const savedActivity = await this.activitiesRepository.save(activity);

    await this.eventEmitter.emit('activity.created', {
      tenantId,
      activityId: savedActivity.id,
      contactId: savedActivity.contactId,
      type: savedActivity.type,
      userId,
    });

    return savedActivity;
  }

  async findAll(tenantId: string, page = 1, limit = 10, filters?: any): Promise<{ data: Activity[]; total: number }> {
    const query = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .where('activity.tenantId = :tenantId', { tenantId });

    if (filters?.contactId) {
      query.andWhere('activity.contactId = :contactId', { contactId: filters.contactId });
    }

    if (filters?.opportunityId) {
      query.andWhere('activity.opportunityId = :opportunityId', { opportunityId: filters.opportunityId });
    }

    if (filters?.type) {
      query.andWhere('activity.type = :type', { type: filters.type });
    }

    if (filters?.completed !== undefined) {
      query.andWhere('activity.completed = :completed', { completed: filters.completed });
    }

    if (filters?.search) {
      query.andWhere(
        '(activity.subject ILIKE :search OR activity.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('activity.dueDate', 'ASC')
      .addOrderBy('activity.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, tenantId },
      relations: ['contact'],
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(tenantId: string, id: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity> {
    const activity = await this.findOne(tenantId, id);
    
    Object.assign(activity, updateActivityDto);
    const updatedActivity = await this.activitiesRepository.save(activity);

    await this.eventEmitter.emit('activity.updated', {
      tenantId,
      activityId: id,
      changes: updateActivityDto,
      userId,
    });

    return updatedActivity;
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const activity = await this.findOne(tenantId, id);
    await this.activitiesRepository.remove(activity);

    await this.eventEmitter.emit('activity.deleted', {
      tenantId,
      activityId: id,
      userId,
    });
  }

  async markCompleted(tenantId: string, id: string, userId: string): Promise<Activity> {
    const activity = await this.findOne(tenantId, id);
    
    activity.completed = true;
    const updatedActivity = await this.activitiesRepository.save(activity);

    await this.eventEmitter.emit('activity.completed', {
      tenantId,
      activityId: id,
      userId,
    });

    return updatedActivity;
  }

  async getUpcoming(tenantId: string, userId?: string, days = 7): Promise<Activity[]> {
    const query = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere('activity.completed = false')
      .andWhere('activity.dueDate IS NOT NULL')
      .andWhere('activity.dueDate >= CURRENT_DATE')
      .andWhere('activity.dueDate <= CURRENT_DATE + INTERVAL :days DAY', { days });

    if (userId) {
      query.andWhere('activity.ownerId = :userId', { userId });
    }

    return query
      .orderBy('activity.dueDate', 'ASC')
      .getMany();
  }

  async getOverdue(tenantId: string, userId?: string): Promise<Activity[]> {
    const query = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere('activity.completed = false')
      .andWhere('activity.dueDate IS NOT NULL')
      .andWhere('activity.dueDate < CURRENT_DATE');

    if (userId) {
      query.andWhere('activity.ownerId = :userId', { userId });
    }

    return query
      .orderBy('activity.dueDate', 'ASC')
      .getMany();
  }
}