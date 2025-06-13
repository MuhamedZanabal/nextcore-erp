import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ description: 'Contact ID' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ description: 'Opportunity name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Opportunity value' })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Opportunity stage' })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({ description: 'Probability (0-100)' })
  @IsOptional()
  @IsNumber()
  probability?: number;

  @ApiPropertyOptional({ description: 'Expected close date' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}