import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './controllers/contacts.controller';
import { ContactsService } from './services/contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: ContactsService;

  const mockContactsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    getContactActivities: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact', async () => {
      const createContactDto: CreateContactDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        jobTitle: 'CEO',
      };
      const req = { user: { id: 'user-1' } };
      const tenantId = 'default-tenant';
      const expectedResult = {
        id: '1',
        tenantId: 'tenant-1',
        ...createContactDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockContactsService.create.mockResolvedValue(expectedResult);
      const result = await controller.create(tenantId, req, createContactDto);
      expect(service.create).toHaveBeenCalledWith(tenantId, req.user.id, createContactDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated contacts', async () => {
      const tenantId = 'default-tenant';
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = {
        items: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockContactsService.findAll.mockResolvedValue([[expectedResult.items[0]], 1]);
      const result = await controller.findAll(tenantId, queryDto);
      expect(service.findAll).toHaveBeenCalledWith(tenantId, queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a contact by id', async () => {
      const tenantId = 'default-tenant';
      const contactId = '1';
      const expectedResult = {
        id: contactId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };
      mockContactsService.findOne.mockResolvedValue(expectedResult);
      const result = await controller.findOne(tenantId, contactId);
      expect(service.findOne).toHaveBeenCalledWith(tenantId, contactId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      const tenantId = 'default-tenant';
      const contactId = '1';
      const updateContactDto: UpdateContactDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const expectedResult = {
        id: contactId,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john.doe@example.com',
      };
      mockContactsService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(tenantId, contactId, updateContactDto);
      expect(service.update).toHaveBeenCalledWith(tenantId, contactId, updateContactDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      const tenantId = 'default-tenant';
      const contactId = '1';
      mockContactsService.remove.mockResolvedValue(undefined);
      await controller.remove(tenantId, contactId);
      expect(service.remove).toHaveBeenCalledWith(tenantId, contactId);
    });
  });

  // The following tests are commented out because the controller does not have these methods
  // describe('search', () => {
  //   it('should search contacts', async () => {
  //     // ...
  //   });
  // });
  // describe('getActivities', () => {
  //   it('should return contact activities', async () => {
  //     // ...
  //   });
  // });
});