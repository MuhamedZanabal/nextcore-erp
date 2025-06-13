import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from '../services/opportunities.service';
import { CreateOpportunityDto } from '../dto/create-opportunity.dto';
import { UpdateOpportunityDto } from '../dto/update-opportunity.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant } from '../../../common/decorators/tenant.decorator';
import { User } from '../../../common/decorators/user.decorator';

@ApiTags('opportunities')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  create(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(tenantId, createOpportunityDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities' })
  @ApiResponse({ status: 200, description: 'Opportunities retrieved successfully' })
  findAll(
    @Tenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.opportunitiesService.findAll(tenantId, page, limit, search);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get pipeline metrics' })
  @ApiResponse({ status: 200, description: 'Pipeline metrics retrieved successfully' })
  getMetrics(@Tenant() tenantId: string) {
    return this.opportunitiesService.getPipelineMetrics(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity by ID' })
  @ApiResponse({ status: 200, description: 'Opportunity retrieved successfully' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.opportunitiesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity' })
  @ApiResponse({ status: 200, description: 'Opportunity updated successfully' })
  update(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(tenantId, id, updateOpportunityDto, userId);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update opportunity stage' })
  @ApiResponse({ status: 200, description: 'Opportunity stage updated successfully' })
  updateStage(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body('stage') stage: string,
  ) {
    return this.opportunitiesService.updateStage(tenantId, id, stage, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an opportunity' })
  @ApiResponse({ status: 200, description: 'Opportunity deleted successfully' })
  remove(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.remove(tenantId, id, userId);
  }
}