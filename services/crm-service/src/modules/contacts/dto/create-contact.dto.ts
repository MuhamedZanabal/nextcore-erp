import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @ApiProperty({ description: 'First name of the contact' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the contact' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the contact' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the contact' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name of the contact' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Job title of the contact' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Custom fields for the contact', type: 'object' })
  @IsOptional()
  @Type(() => Object)
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'ID of the user who owns this contact' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}