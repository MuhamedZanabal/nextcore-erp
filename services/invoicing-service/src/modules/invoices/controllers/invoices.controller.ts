import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    const tenantId = 'default-tenant';
    const userId = 'default-user';
    return this.invoicesService.create(tenantId, createInvoiceDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const tenantId = 'default-tenant';
    return this.invoicesService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  findOne(@Param('id') id: string) {
    const tenantId = 'default-tenant';
    return this.invoicesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    const tenantId = 'default-tenant';
    return this.invoicesService.update(tenantId, id, updateInvoiceDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated successfully' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const tenantId = 'default-tenant';
    return this.invoicesService.updateStatus(tenantId, id, status);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalize an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice finalized successfully' })
  finalize(@Param('id') id: string) {
    const tenantId = 'default-tenant';
    return this.invoicesService.finalize(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  remove(@Param('id') id: string) {
    const tenantId = 'default-tenant';
    return this.invoicesService.remove(tenantId, id);
  }
}