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
