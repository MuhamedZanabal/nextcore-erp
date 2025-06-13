import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { tenantId },
      relations: ['roles'],
    });
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, tenantId: string, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id, tenantId);
    
    // Update user properties
    Object.assign(user, userData);
    
    return this.usersRepository.save(user);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.usersRepository.remove(user);
  }
}