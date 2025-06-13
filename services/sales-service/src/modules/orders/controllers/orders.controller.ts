import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  create(@Body() createOrderDto: CreateOrderDto) {
    const tenantId = 'default-tenant';
    const userId = 'default-user';
    return this.ordersService.create(tenantId, createOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const tenantId = 'default-tenant';
    return this.ordersService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  findOne(@Param('id') id: string) {
    const tenantId = 'default-tenant';
    return this.ordersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const tenantId = 'default-tenant';
    return this.ordersService.update(tenantId, id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const tenantId = 'default-tenant';
    return this.ordersService.updateStatus(tenantId, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  remove(@Param('id') id: string) {
    const tenantId = 'default-tenant';
    return this.ordersService.remove(tenantId, id);
  }
}
