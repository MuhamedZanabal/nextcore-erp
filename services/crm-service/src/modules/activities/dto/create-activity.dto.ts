import { IsString, IsOptional, IsBoolean, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiPropertyOptional({ description: 'Contact ID' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Opportunity ID' })
  @IsOptional()
  @IsUUID()
  opportunityId?: string;

  @ApiProperty({ description: 'Activity type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Activity subject' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: 'Activity description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Completed status' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}