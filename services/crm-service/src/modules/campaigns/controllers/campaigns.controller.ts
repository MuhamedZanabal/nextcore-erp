import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from '../services/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant } from '../../../common/decorators/tenant.decorator';
import { User } from '../../../common/decorators/user.decorator';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  create(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(tenantId, createCampaignDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  findAll(
    @Tenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.campaignsService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(tenantId, id);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get campaign metrics' })
  @ApiResponse({ status: 200, description: 'Campaign metrics retrieved successfully' })
  getMetrics(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.getMetrics(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  update(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(tenantId, id, updateCampaignDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status' })
  @ApiResponse({ status: 200, description: 'Campaign status updated successfully' })
  updateStatus(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.campaignsService.updateStatus(tenantId, id, status, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  remove(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.campaignsService.remove(tenantId, id, userId);
  }
}