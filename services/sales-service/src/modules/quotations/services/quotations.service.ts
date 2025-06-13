import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';
import { QuotationLine } from '../entities/quotation-line.entity';
import { CreateQuotationDto } from '../dto/create-quotation.dto';
import { UpdateQuotationDto } from '../dto/update-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    @InjectRepository(QuotationLine)
    private quotationLinesRepository: Repository<QuotationLine>,
  ) {}

  async create(tenantId: string, createQuotationDto: CreateQuotationDto, userId: string): Promise<Quotation> {
    const quotation = this.quotationsRepository.create({
      tenantId,
      customerId: createQuotationDto.customerId,
      validUntil: createQuotationDto.validUntil ? new Date(createQuotationDto.validUntil) : null,
      currency: createQuotationDto.currency || 'USD',
      terms: createQuotationDto.terms,
      createdById: userId,
    });

    const savedQuotation = await this.quotationsRepository.save(quotation);

    // Create quotation lines
    const lines = createQuotationDto.lines.map(lineDto => {
      const subtotal = lineDto.quantity * lineDto.unitPrice;
      const discountAmount = subtotal * (lineDto.discountPercent || 0) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (lineDto.taxPercent || 0) / 100;
      const total = taxableAmount + taxAmount;

      return this.quotationLinesRepository.create({
        quotationId: savedQuotation.id,
        productId: lineDto.productId,
        quantity: lineDto.quantity,
        unitPrice: lineDto.unitPrice,
        discountPercent: lineDto.discountPercent || 0,
        taxPercent: lineDto.taxPercent || 0,
        subtotal,
        total,
      });
    });

    await this.quotationLinesRepository.save(lines);

    // Calculate totals
    const subtotal = lines.reduce((sum, line) => sum + Number(line.subtotal), 0);
    const discountAmount = lines.reduce((sum, line) => sum + (Number(line.subtotal) * line.discountPercent / 100), 0);
    const taxAmount = lines.reduce((sum, line) => sum + ((Number(line.subtotal) - (Number(line.subtotal) * line.discountPercent / 100)) * line.taxPercent / 100), 0);
    const total = subtotal - discountAmount + taxAmount;

    savedQuotation.subtotal = subtotal;
    savedQuotation.discountAmount = discountAmount;
    savedQuotation.taxAmount = taxAmount;
    savedQuotation.total = total;

    return this.quotationsRepository.save(savedQuotation);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Quotation[]; total: number }> {
    const query = this.quotationsRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.lines', 'lines')
      .where('quotation.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('quotation.customerId ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('quotation.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Quotation> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id, tenantId },
      relations: ['lines'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async update(tenantId: string, id: string, updateQuotationDto: UpdateQuotationDto, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(tenantId, id);

    if (quotation.status !== 'draft') {
      throw new Error('Can only update draft quotations');
    }

    Object.assign(quotation, {
      customerId: updateQuotationDto.customerId,
      validUntil: updateQuotationDto.validUntil ? new Date(updateQuotationDto.validUntil) : quotation.validUntil,
      currency: updateQuotationDto.currency,
      terms: updateQuotationDto.terms,
    });

    if (updateQuotationDto.lines) {
      // Remove existing lines
      await this.quotationLinesRepository.delete({ quotationId: id });

      // Create new lines
      const lines = updateQuotationDto.lines.map(lineDto => {
        const subtotal = lineDto.quantity * lineDto.unitPrice;
        const discountAmount = subtotal * (lineDto.discountPercent || 0) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (lineDto.taxPercent || 0) / 100;
        const total = taxableAmount + taxAmount;

        return this.quotationLinesRepository.create({
          quotationId: id,
          productId: lineDto.productId,
          quantity: lineDto.quantity,
          unitPrice: lineDto.unitPrice,
          discountPercent: lineDto.discountPercent || 0,
          taxPercent: lineDto.taxPercent || 0,
          subtotal,
          total,
        });
      });

      await this.quotationLinesRepository.save(lines);

      // Recalculate totals
      const subtotal = lines.reduce((sum, line) => sum + Number(line.subtotal), 0);
      const discountAmount = lines.reduce((sum, line) => sum + (Number(line.subtotal) * line.discountPercent / 100), 0);
      const taxAmount = lines.reduce((sum, line) => sum + ((Number(line.subtotal) - (Number(line.subtotal) * line.discountPercent / 100)) * line.taxPercent / 100), 0);
      const total = subtotal - discountAmount + taxAmount;

      quotation.subtotal = subtotal;
      quotation.discountAmount = discountAmount;
      quotation.taxAmount = taxAmount;
      quotation.total = total;
    }

    return this.quotationsRepository.save(quotation);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const quotation = await this.findOne(tenantId, id);
    await this.quotationsRepository.remove(quotation);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<Quotation> {
    const quotation = await this.findOne(tenantId, id);
    quotation.status = status;
    return this.quotationsRepository.save(quotation);
  }

  async convertToOrder(tenantId: string, id: string): Promise<any> {
    const quotation = await this.findOne(tenantId, id);
    
    if (quotation.status !== 'accepted') {
      throw new Error('Can only convert accepted quotations to orders');
    }

    // TODO: Create order in orders service
    // This would typically involve calling the orders service
    
    quotation.status = 'converted';
    await this.quotationsRepository.save(quotation);

    return { message: 'Quotation converted to order successfully' };
  }

  async sendQuotation(tenantId: string, id: string): Promise<Quotation> {
    const quotation = await this.findOne(tenantId, id);
    
    if (quotation.status !== 'draft') {
      throw new Error('Can only send draft quotations');
    }

    quotation.status = 'sent';
    return this.quotationsRepository.save(quotation);
  }
}