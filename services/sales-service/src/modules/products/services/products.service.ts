import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(tenantId: string, createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productsRepository.findOne({
      where: { sku: createProductDto.sku, tenantId },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      tenantId,
    });

    return this.productsRepository.save(product);
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string, categoryId?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productsRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.name', 'ASC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySku(tenantId: string, sku: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { sku, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(tenantId: string, id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(tenantId, id);

    // Check if SKU is being updated and if it conflicts
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productsRepository.findOne({
        where: { sku: updateProductDto.sku, tenantId },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const product = await this.findOne(tenantId, id);
    await this.productsRepository.remove(product);
  }

  async getActiveProducts(tenantId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { tenantId, active: true },
      order: { name: 'ASC' },
    });
  }

  async updatePrice(tenantId: string, id: string, newPrice: number): Promise<Product> {
    const product = await this.findOne(tenantId, id);
    product.listPrice = newPrice;
    return this.productsRepository.save(product);
  }

  async bulkUpdatePrices(tenantId: string, updates: { id: string; price: number }[]): Promise<void> {
    for (const update of updates) {
      await this.updatePrice(tenantId, update.id, update.price);
    }
  }
}