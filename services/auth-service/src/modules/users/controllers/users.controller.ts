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
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users for the current tenant' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Req() req: Request): Promise<User[]> {
    const { tenantId } = req.user as any;
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<User> {
    const { tenantId } = req.user as any;
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() createUserDto: Partial<User>, @Req() req: Request): Promise<User> {
    const { tenantId } = req.user as any;
    return this.usersService.create({ ...createUserDto, tenantId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
    @Req() req: Request,
  ): Promise<User> {
    const { tenantId } = req.user as any;
    return this.usersService.update(id, tenantId, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const { tenantId } = req.user as any;
    return this.usersService.remove(id, tenantId);
  }
}