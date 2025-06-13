import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactResponseDto {
  @ApiProperty({ description: 'Unique identifier of the contact' })
  id: string;

  @ApiProperty({ description: 'Tenant ID the contact belongs to' })
  tenantId: string;

  @ApiProperty({ description: 'First name of the contact' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the contact' })
  lastName: string;

  @ApiProperty({ description: 'Email address of the contact' })
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the contact' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name of the contact' })
  company?: string;

  @ApiPropertyOptional({ description: 'Job title of the contact' })
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Custom fields for the contact', type: 'object' })
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'ID of the user who owns this contact' })
  ownerId?: string;

  @ApiProperty({ description: 'ID of the user who created this contact' })
  createdById: string;

  @ApiProperty({ description: 'Date and time when the contact was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the contact was last updated' })
  updatedAt: Date;
}