import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from '../services/contacts.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { QueryContactsDto } from '../dto/query-contacts.dto';
import { ContactResponseDto } from '../dto/contact-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Tenant } from '../../../common/decorators/tenant.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(AuthGuard, TenantGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ status: 201, description: 'The contact has been successfully created.', type: ContactResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Contact with this email already exists.' })
  async create(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    return this.contactsService.create(tenantId, req.user.id, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of contacts.', type: [ContactResponseDto] })
  async findAll(
    @Tenant() tenantId: string,
    @Query() queryDto: QueryContactsDto,
  ): Promise<{ items: ContactResponseDto[]; total: number; page: number; limit: number }> {
    const [contacts, total] = await this.contactsService.findAll(tenantId, queryDto);
    
    return {
      items: contacts,
      total,
      page: queryDto.page || 1,
      limit: queryDto.limit || 10,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'The contact.', type: ContactResponseDto })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async findOne(
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<ContactResponseDto> {
    return this.contactsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'The contact has been successfully updated.', type: ContactResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  @ApiResponse({ status: 409, description: 'Contact with this email already exists.' })
  async update(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    return this.contactsService.update(tenantId, id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'The contact has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async remove(
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.contactsService.remove(tenantId, id);
  }
}