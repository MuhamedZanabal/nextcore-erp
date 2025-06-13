import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { Role } from '../entities/role.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles for the current tenant' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll(@Req() req: Request): Promise<Role[]> {
    const { tenantId } = req.user as any;
    return this.rolesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Role> {
    const { tenantId } = req.user as any;
    return this.rolesService.findOne(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(@Body() createRoleDto: Partial<Role>, @Req() req: Request): Promise<Role> {
    const { tenantId } = req.user as any;
    return this.rolesService.create({ ...createRoleDto, tenantId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: Partial<Role>,
    @Req() req: Request,
  ): Promise<Role> {
    const { tenantId } = req.user as any;
    return this.rolesService.update(id, tenantId, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const { tenantId } = req.user as any;
    return this.rolesService.remove(id, tenantId);
  }
}