import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Campaign type' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Campaign status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Budget' })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Target audience criteria' })
  @IsOptional()
  @IsObject()
  targetAudience?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}