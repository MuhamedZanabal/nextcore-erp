import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from '../services/tenants.service';
import { Tenant } from '../entities/tenant.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  async findAll(): Promise<Tenant[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created' })
  async create(@Body() createTenantDto: Partial<Tenant>): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tenantsService.remove(id);
  }
}