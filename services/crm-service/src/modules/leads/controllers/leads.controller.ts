import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from '../services/leads.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant } from '../../../common/decorators/tenant.decorator';
import { User } from '../../../common/decorators/user.decorator';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Body() createLeadDto: CreateLeadDto,
  ) {
    return this.leadsService.create(tenantId, createLeadDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(
    @Tenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.leadsService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  update(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(tenantId, id, updateLeadDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  remove(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.remove(tenantId, id, userId);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to opportunity' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully' })
  convert(
    @Tenant() tenantId: string,
    @User('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.convertToOpportunity(tenantId, id, userId);
  }
}