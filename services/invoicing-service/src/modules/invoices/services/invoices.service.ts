import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceLine } from '../entities/invoice-line.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLine)
    private invoiceLinesRepository: Repository<InvoiceLine>,
  ) {}

  async create(tenantId: string, createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    const invoice = this.invoicesRepository.create({
      tenantId,
      invoiceNumber,
      customerId: createInvoiceDto.customerId,
      orderId: createInvoiceDto.orderId,
      issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
      dueDate: new Date(createInvoiceDto.dueDate),
      currency: createInvoiceDto.currency || 'USD',
      notes: createInvoiceDto.notes,
      createdById: userId,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Create invoice lines
    const lines = createInvoiceDto.lines.map(lineDto => {
      const subtotal = lineDto.quantity * lineDto.unitPrice;
      const discountAmount = subtotal * (lineDto.discountPercent || 0) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (lineDto.taxPercent || 0) / 100;
      const total = taxableAmount + taxAmount;

      return this.invoiceLinesRepository.create({
        invoiceId: savedInvoice.id,
        productId: lineDto.productId,
        description: lineDto.description,
        quantity: lineDto.quantity,
        unitPrice: lineDto.unitPrice,
        discountPercent: lineDto.discountPercent || 0,
        taxPercent: lineDto.taxPercent || 0,
        subtotal,
        total,
      });
    });

    await this.invoiceLinesRepository.save(lines);

    // Calculate totals
    const subtotal = lines.reduce((sum, line) => sum + Number(line.subtotal), 0);
    const discountAmount = lines.reduce((sum, line) => sum + (Number(line.subtotal) * line.discountPercent / 100), 0);
    const taxAmount = lines.reduce((sum, line) => sum + ((Number(line.subtotal) - (Number(line.subtotal) * line.discountPercent / 100)) * line.taxPercent / 100), 0);
    const total = subtotal - discountAmount + taxAmount;

    savedInvoice.subtotal = subtotal;
    savedInvoice.discountAmount = discountAmount;
    savedInvoice.taxAmount = taxAmount;
    savedInvoice.total = total;

    return this.invoicesRepository.save(savedInvoice);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string): Promise<{ data: Invoice[]; total: number }> {
    const query = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.lines', 'lines')
      .where('invoice.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('(invoice.invoiceNumber ILIKE :search OR invoice.customerId ILIKE :search)', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('invoice.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, tenantId },
      relations: ['lines'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(tenantId: string, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);

    if (invoice.status !== 'draft') {
      throw new Error('Cannot update non-draft invoice');
    }

    Object.assign(invoice, updateInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const invoice = await this.findOne(tenantId, id);
    
    if (invoice.status !== 'draft') {
      throw new Error('Cannot delete non-draft invoice');
    }

    await this.invoicesRepository.remove(invoice);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    invoice.status = status;
    return this.invoicesRepository.save(invoice);
  }

  async finalize(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);
    
    if (invoice.status !== 'draft') {
      throw new Error('Invoice is already finalized');
    }

    invoice.status = 'sent';
    return this.invoicesRepository.save(invoice);
  }

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoicesRepository.count({
      where: { tenantId },
    });
    
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}