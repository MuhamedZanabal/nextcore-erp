import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService } from '../services/quotations.service';
import { CreateQuotationDto } from '../dto/create-quotation.dto';
import { UpdateQuotationDto } from '../dto/update-quotation.dto';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  create(
    @Body() createQuotationDto: CreateQuotationDto,
  ) {
    // TODO: Extract tenant and user from JWT token
    const tenantId = 'default-tenant';
    const userId = 'default-user';
    return this.quotationsService.create(tenantId, createQuotationDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations' })
  @ApiResponse({ status: 200, description: 'Quotations retrieved successfully' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quotation by ID' })
  @ApiResponse({ status: 200, description: 'Quotation retrieved successfully' })
  findOne(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quotation' })
  @ApiResponse({ status: 200, description: 'Quotation updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    // TODO: Extract tenant and user from JWT token
    const tenantId = 'default-tenant';
    const userId = 'default-user';
    return this.quotationsService.update(tenantId, id, updateQuotationDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update quotation status' })
  @ApiResponse({ status: 200, description: 'Quotation status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.updateStatus(tenantId, id, status);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send quotation to customer' })
  @ApiResponse({ status: 200, description: 'Quotation sent successfully' })
  sendQuotation(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.sendQuotation(tenantId, id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert quotation to order' })
  @ApiResponse({ status: 200, description: 'Quotation converted to order successfully' })
  convertToOrder(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.convertToOrder(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quotation' })
  @ApiResponse({ status: 200, description: 'Quotation deleted successfully' })
  remove(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.quotationsService.remove(tenantId, id);
  }
}