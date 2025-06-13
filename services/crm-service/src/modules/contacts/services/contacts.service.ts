import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { QueryContactsDto } from '../dto/query-contacts.dto';
import { EventEmitterService } from '../../../common/services/event-emitter.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    private eventEmitter: EventEmitterService,
  ) {}

  async create(tenantId: string, userId: string, createContactDto: CreateContactDto): Promise<Contact> {
    // Check if contact with the same email already exists
    const existingContact = await this.contactsRepository.findOne({
      where: { 
        tenantId,
        email: createContactDto.email,
      },
    });

    if (existingContact) {
      throw new ConflictException(`Contact with email ${createContactDto.email} already exists`);
    }

    const contact = this.contactsRepository.create({
      ...createContactDto,
      tenantId,
      createdById: userId,
      ownerId: createContactDto.ownerId || userId,
    });

    const savedContact = await this.contactsRepository.save(contact);
    
    // Emit contact created event
    await this.eventEmitter.emitContactCreated(tenantId, savedContact);
    
    return savedContact;
  }

  async findAll(tenantId: string, queryDto: QueryContactsDto): Promise<[Contact[], number]> {
    const { search, ownerId, company, page = 1, limit = 10 } = queryDto;
    
    const where: FindOptionsWhere<Contact> = { tenantId };
    
    if (ownerId) {
      where.ownerId = ownerId;
    }
    
    if (company) {
      where.company = company;
    }
    
    if (search) {
      return this.contactsRepository.findAndCount({
        where: [
          { ...where, firstName: Like(`%${search}%`) },
          { ...where, lastName: Like(`%${search}%`) },
          { ...where, email: Like(`%${search}%`) },
          { ...where, company: Like(`%${search}%`) },
        ],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });
    }
    
    return this.contactsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { tenantId, id },
    });
    
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    
    return contact;
  }

  async update(tenantId: string, id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(tenantId, id);
    
    // Check if trying to update email to one that already exists
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existingContact = await this.contactsRepository.findOne({
        where: { 
          tenantId,
          email: updateContactDto.email,
        },
      });
      
      if (existingContact) {
        throw new ConflictException(`Contact with email ${updateContactDto.email} already exists`);
      }
    }
    
    const updatedContact = await this.contactsRepository.save({
      ...contact,
      ...updateContactDto,
    });
    
    // Emit contact updated event
    await this.eventEmitter.emitContactUpdated(tenantId, updatedContact);
    
    return updatedContact;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const contact = await this.findOne(tenantId, id);
    await this.contactsRepository.remove(contact);
  }
}