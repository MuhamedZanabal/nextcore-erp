import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from '../services/activities.service';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant } from '../../../common/decorators/tenant.decorator';
import { User } from '../../../common/decorators/user.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  create(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    return this.activitiesService.create(tenantId, createActivityDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  findAll(
    @Tenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('contactId') contactId?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('type') type?: string,
    @Query('completed') completed?: boolean,
    @Query('search') search?: string,
  ) {
    const filters = { contactId, opportunityId, type, completed, search };
    return this.activitiesService.findAll(tenantId, page, limit, filters);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming activities' })
  @ApiResponse({ status: 200, description: 'Upcoming activities retrieved successfully' })
  getUpcoming(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Query('days') days?: number,
  ) {
    return this.activitiesService.getUpcoming(tenantId, userId, days);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue activities' })
  @ApiResponse({ status: 200, description: 'Overdue activities retrieved successfully' })
  getOverdue(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
  ) {
    return this.activitiesService.getOverdue(tenantId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.activitiesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  update(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(tenantId, id, updateActivityDto, userId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark activity as completed' })
  @ApiResponse({ status: 200, description: 'Activity marked as completed' })
  markCompleted(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.markCompleted(tenantId, id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  remove(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.remove(tenantId, id, userId);
  }
}