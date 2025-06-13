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

      const expectedResult = {
        id: '1',
        tenantId: 'tenant-1',
        ...createContactDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContactsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createContactDto);

      expect(service.create).toHaveBeenCalledWith('default-tenant', createContactDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated contacts', async () => {
      const expectedResult = {
        data: [
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

      mockContactsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith('default-tenant', 1, 10, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a contact by id', async () => {
      const contactId = '1';
      const expectedResult = {
        id: contactId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      mockContactsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(contactId);

      expect(service.findOne).toHaveBeenCalledWith('default-tenant', contactId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
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

      const result = await controller.update(contactId, updateContactDto);

      expect(service.update).toHaveBeenCalledWith('default-tenant', contactId, updateContactDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      const contactId = '1';

      mockContactsService.remove.mockResolvedValue(undefined);

      await controller.remove(contactId);

      expect(service.remove).toHaveBeenCalledWith('default-tenant', contactId);
    });
  });

  describe('search', () => {
    it('should search contacts', async () => {
      const query = 'john';
      const expectedResult = {
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        ],
        total: 1,
      };

      mockContactsService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(query);

      expect(service.search).toHaveBeenCalledWith('default-tenant', query, 1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getActivities', () => {
    it('should return contact activities', async () => {
      const contactId = '1';
      const expectedResult = [
        {
          id: '1',
          type: 'call',
          subject: 'Follow up call',
          dueDate: new Date(),
        },
      ];

      mockContactsService.getContactActivities.mockResolvedValue(expectedResult);

      const result = await controller.getActivities(contactId);

      expect(service.getContactActivities).toHaveBeenCalledWith('default-tenant', contactId);
      expect(result).toEqual(expectedResult);
    });
  });
});