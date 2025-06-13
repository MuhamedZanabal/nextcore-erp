import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Body() createProductDto: CreateProductDto,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.create(tenantId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.findAll(tenantId, page, limit, search, categoryId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active products' })
  @ApiResponse({ status: 200, description: 'Active products retrieved successfully' })
  getActiveProducts() {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.getActiveProducts(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findOne(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.findOne(tenantId, id);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get a product by SKU' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findBySku(@Param('sku') sku: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.findBySku(tenantId, sku);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.update(tenantId, id, updateProductDto);
  }

  @Patch(':id/price')
  @ApiOperation({ summary: 'Update product price' })
  @ApiResponse({ status: 200, description: 'Product price updated successfully' })
  updatePrice(
    @Param('id') id: string,
    @Body('price') price: number,
  ) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.updatePrice(tenantId, id, price);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  remove(@Param('id') id: string) {
    // TODO: Extract tenant from JWT token
    const tenantId = 'default-tenant';
    return this.productsService.remove(tenantId, id);
  }
}