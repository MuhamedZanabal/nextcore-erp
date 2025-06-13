import { IsString, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceLineDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Tax percentage' })
  @IsOptional()
  @IsNumber()
  taxPercent?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Issue date' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Invoice lines', type: [CreateInvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines: CreateInvoiceLineDto[];
}