#!/bin/bash

# Complete All NextCore ERP Services Implementation
echo "🚀 Completing ALL NextCore ERP Services..."

# Complete Sales Service Orders Module
echo "📋 Completing Sales Service Orders Module..."

cat > /workspace/NextCoreERP/services/sales-service/src/modules/orders/dto/create-order.dto.ts << 'EOF'
import { IsString, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderLineDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

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

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ description: 'Quotation ID' })
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @ApiPropertyOptional({ description: 'Order date' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Billing address' })
  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Order lines', type: [CreateOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderLineDto)
  lines: CreateOrderLineDto[];
}
EOF

cat > /workspace/NextCoreERP/services/sales-service/src/modules/orders/dto/update-order.dto.ts << 'EOF'
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
EOF

cat > /workspace/NextCoreERP/services/sales-service/src/modules/orders/services/orders.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderLine } from '../entities/order-line.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderLine)
    private orderLinesRepository: Repository<OrderLine>,
  ) {}

  async create(tenantId: string, createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const order = this.ordersRepository.create({
      tenantId,
      customerId: createOrderDto.customerId,
      quotationId: createOrderDto.quotationId,
      orderDate: createOrderDto.orderDate ? new Date(createOrderDto.orderDate) : new Date(),
      expectedDeliveryDate: createOrderDto.expectedDeliveryDate ? new Date(createOrderDto.expectedDeliveryDate) : null,
      currency: createOrderDto.currency || 'USD',
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      notes: createOrderDto.notes,
      createdById: userId,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order lines
    const lines = createOrderDto.lines.map(lineDto => {
      const subtotal = lineDto.quantity * lineDto.unitPrice;
      const discountAmount = subtotal * (lineDto.discountPercent || 0) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (lineDto.taxPercent || 0) / 100;
      const total = taxableAmount + taxAmount;

      return this.orderLinesRepository.create({
        orderId: savedOrder.id,
        productId: lineDto.productId,
        quantity: lineDto.quantity,
        unitPrice: lineDto.unitPrice,
        discountPercent: lineDto.discountPercent || 0,
        taxPercent: lineDto.taxPercent || 0,
        subtotal,
        total,
      });
    });

    await this.orderLinesRepository.save(lines);

    // Calculate totals
    const subtotal = lines.reduce((sum, line) => sum + Number(line.subtotal), 0);
    const discountAmount = lines.reduce((sum, line) => sum + (Number(line.subtotal) * line.discountPercent / 100), 0);
    const taxAmount = lines.reduce((sum, line) => sum + ((Number(line.subtotal) - (Number(line.subtotal) * line.discountPercent / 100)) * line.taxPercent / 100), 0);
    const total = subtotal - discountAmount + taxAmount;

    savedOrder.subtotal = subtotal;
    savedOrder.discountAmount = discountAmount;
    savedOrder.taxAmount = taxAmount;
    savedOrder.total = total;

    return this.ordersRepository.save(savedOrder);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Order[]; total: number }> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.lines', 'lines')
      .where('order.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('order.customerId ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, tenantId },
      relations: ['lines'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(tenantId: string, id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(tenantId, id);

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const order = await this.findOne(tenantId, id);
    await this.ordersRepository.remove(order);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<Order> {
    const order = await this.findOne(tenantId, id);
    order.status = status;
    return this.ordersRepository.save(order);
  }
}
EOF

cat > /workspace/NextCoreERP/services/sales-service/src/modules/orders/controllers/orders.controller.ts << 'EOF'
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
EOF

cat > /workspace/NextCoreERP/services/sales-service/src/modules/orders/orders.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { OrderLine } from './entities/order-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderLine])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
EOF

# Complete Invoicing Service
echo "💰 Completing Invoicing Service..."

cat > /workspace/NextCoreERP/services/invoicing-service/src/modules/invoices/entities/invoice.entity.ts << 'EOF'
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { InvoiceLine } from './invoice-line.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ default: 'draft' })
  status: string; // draft, sent, paid, overdue, cancelled

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdById: string;

  @OneToMany(() => InvoiceLine, line => line.invoice, { cascade: true })
  lines: InvoiceLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
EOF

cat > /workspace/NextCoreERP/services/invoicing-service/src/modules/invoices/entities/invoice-line.entity.ts << 'EOF'
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_lines')
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string;

  @ManyToOne(() => Invoice, invoice => invoice.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true })
  productId: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
EOF

# Create comprehensive Inventory Service
echo "📦 Creating comprehensive Inventory Service..."

mkdir -p /workspace/NextCoreERP/services/inventory-service/src/{modules/{stock,warehouses,movements}/{entities,dto,controllers,services},common}

cat > /workspace/NextCoreERP/services/inventory-service/package.json << 'EOF'
{
  "name": "inventory-service",
  "version": "0.1.0",
  "description": "Inventory Service for NextCore ERP",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "nats": "^2.15.1",
    "pg": "^8.11.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.17"
  }
}
EOF

cat > /workspace/NextCoreERP/services/inventory-service/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/inventory');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('NextCore ERP Inventory Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/inventory/docs', app, document);

  await app.listen(process.env.PORT || 4003);
  console.log(`Inventory Service running on port ${process.env.PORT || 4003}`);
}
bootstrap();
EOF

cat > /workspace/NextCoreERP/services/inventory-service/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from './modules/stock/stock.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { MovementsModule } from './modules/movements/movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'nextcore'),
        password: configService.get('DB_PASSWORD', 'nextcore'),
        database: configService.get('DB_DATABASE', 'nextcore'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', false),
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
    
    StockModule,
    WarehousesModule,
    MovementsModule,
  ],
})
export class AppModule {}
EOF

echo "✅ All services structure created!"
echo "🔧 Services are now ready for detailed implementation!"
EOF

chmod +x /workspace/NextCoreERP/scripts/complete_all_services.sh