import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(tenantId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { tenantId },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id, tenantId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  async update(id: string, tenantId: string, roleData: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id, tenantId);
    
    // Update role properties
    Object.assign(role, roleData);
    
    return this.rolesRepository.save(role);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const role = await this.findOne(id, tenantId);
    
    // Prevent deletion of system roles
    if (role.isSystemRole) {
      throw new Error('System roles cannot be deleted');
    }
    
    await this.rolesRepository.remove(role);
  }
}