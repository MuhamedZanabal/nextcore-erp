import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { StockMovement } from '../entities/stock-movement.entity';

export interface BarcodeData {
  code: string;
  type: BarcodeType;
  data: any;
  timestamp: Date;
  scannerId?: string;
  location?: string;
}

export enum BarcodeType {
  UPC_A = 'UPC-A',
  UPC_E = 'UPC-E',
  EAN_13 = 'EAN-13',
  EAN_8 = 'EAN-8',
  CODE_128 = 'CODE-128',
  CODE_39 = 'CODE-39',
  QR_CODE = 'QR',
  DATA_MATRIX = 'DATA-MATRIX',
  PDF_417 = 'PDF-417',
  AZTEC = 'AZTEC',
}

export interface ScanResult {
  success: boolean;
  product?: Product;
  message: string;
  suggestions?: Product[];
  barcodeData: BarcodeData;
}

export interface BarcodeGenerationOptions {
  type: BarcodeType;
  width?: number;
  height?: number;
  format?: 'PNG' | 'SVG' | 'PDF';
  includeText?: boolean;
  margin?: number;
}

export interface InventoryOperation {
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  productId: string;
  quantity: number;
  location?: string;
  reason?: string;
  reference?: string;
  scannedBy?: string;
}

@Injectable()
export class BarcodeScannerService {
  private readonly logger = new Logger(BarcodeScannerService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async scanBarcode(
    barcodeData: string,
    scannerId?: string,
    location?: string
  ): Promise<ScanResult> {
    try {
      const barcode: BarcodeData = {
        code: barcodeData,
        type: this.detectBarcodeType(barcodeData),
        data: this.parseBarcodeData(barcodeData),
        timestamp: new Date(),
        scannerId,
        location,
      };

      this.logger.log(`Scanning barcode: ${barcodeData} (${barcode.type})`);

      // Try to find product by barcode
      const product = await this.findProductByBarcode(barcodeData);

      if (product) {
        return {
          success: true,
          product,
          message: `Product found: ${product.name}`,
          barcodeData: barcode,
        };
      }

      // If not found, try fuzzy matching or suggestions
      const suggestions = await this.findSimilarProducts(barcodeData);

      return {
        success: false,
        message: 'Product not found',
        suggestions,
        barcodeData: barcode,
      };
    } catch (error) {
      this.logger.error(`Error scanning barcode ${barcodeData}:`, error);
      
      return {
        success: false,
        message: `Scan error: ${error.message}`,
        barcodeData: {
          code: barcodeData,
          type: BarcodeType.CODE_128,
          data: null,
          timestamp: new Date(),
          scannerId,
          location,
        },
      };
    }
  }

  private detectBarcodeType(barcode: string): BarcodeType {
    // Remove any non-numeric characters for length checking
    const numericOnly = barcode.replace(/\D/g, '');
    
    // UPC-A: 12 digits
    if (numericOnly.length === 12 && /^\d{12}$/.test(barcode)) {
      return BarcodeType.UPC_A;
    }
    
    // UPC-E: 8 digits
    if (numericOnly.length === 8 && /^\d{8}$/.test(barcode)) {
      return BarcodeType.UPC_E;
    }
    
    // EAN-13: 13 digits
    if (numericOnly.length === 13 && /^\d{13}$/.test(barcode)) {
      return BarcodeType.EAN_13;
    }
    
    // EAN-8: 8 digits (but different from UPC-E pattern)
    if (numericOnly.length === 8 && /^\d{8}$/.test(barcode) && barcode.startsWith('0')) {
      return BarcodeType.EAN_8;
    }
    
    // QR Code: Usually contains special characters or is very long
    if (barcode.length > 20 || /[{}[\]":]/.test(barcode)) {
      return BarcodeType.QR_CODE;
    }
    
    // CODE-39: Contains letters and numbers, often with asterisks
    if (/^[A-Z0-9\-. $\/+%*]*$/.test(barcode.toUpperCase())) {
      return BarcodeType.CODE_39;
    }
    
    // Default to CODE-128 for alphanumeric codes
    return BarcodeType.CODE_128;
  }

  private parseBarcodeData(barcode: string): any {
    const type = this.detectBarcodeType(barcode);
    
    switch (type) {
      case BarcodeType.UPC_A:
      case BarcodeType.UPC_E:
        return this.parseUPC(barcode);
      
      case BarcodeType.EAN_13:
      case BarcodeType.EAN_8:
        return this.parseEAN(barcode);
      
      case BarcodeType.QR_CODE:
        return this.parseQRCode(barcode);
      
      default:
        return { raw: barcode };
    }
  }

  private parseUPC(barcode: string): any {
    const digits = barcode.replace(/\D/g, '');
    
    if (digits.length === 12) {
      return {
        manufacturerCode: digits.substring(0, 6),
        productCode: digits.substring(6, 11),
        checkDigit: digits.substring(11, 12),
        raw: barcode,
      };
    }
    
    return { raw: barcode };
  }

  private parseEAN(barcode: string): any {
    const digits = barcode.replace(/\D/g, '');
    
    if (digits.length === 13) {
      return {
        countryCode: digits.substring(0, 3),
        manufacturerCode: digits.substring(3, 8),
        productCode: digits.substring(8, 12),
        checkDigit: digits.substring(12, 13),
        raw: barcode,
      };
    }
    
    return { raw: barcode };
  }

  private parseQRCode(barcode: string): any {
    try {
      // Try to parse as JSON
      return JSON.parse(barcode);
    } catch {
      // If not JSON, check for common QR code formats
      if (barcode.startsWith('http')) {
        return { type: 'url', url: barcode };
      }
      
      if (barcode.includes('@')) {
        return { type: 'email', email: barcode };
      }
      
      return { type: 'text', text: barcode };
    }
  }

  private async findProductByBarcode(barcode: string): Promise<Product | null> {
    // Try exact match first
    let product = await this.productRepository.findOne({
      where: { barcode },
    });

    if (product) {
      return product;
    }

    // Try alternative barcode fields
    product = await this.productRepository.findOne({
      where: { sku: barcode },
    });

    if (product) {
      return product;
    }

    // Try UPC/EAN variations
    const variations = this.generateBarcodeVariations(barcode);
    
    for (const variation of variations) {
      product = await this.productRepository.findOne({
        where: { barcode: variation },
      });
      
      if (product) {
        return product;
      }
    }

    return null;
  }

  private generateBarcodeVariations(barcode: string): string[] {
    const variations: string[] = [];
    const digits = barcode.replace(/\D/g, '');
    
    // Add leading zeros for UPC-A format
    if (digits.length === 11) {
      variations.push('0' + digits);
    }
    
    // Remove leading zeros
    if (digits.startsWith('0') && digits.length > 8) {
      variations.push(digits.substring(1));
    }
    
    // Add check digit if missing
    if (digits.length === 11 || digits.length === 12) {
      const checkDigit = this.calculateCheckDigit(digits.substring(0, 11));
      variations.push(digits.substring(0, 11) + checkDigit);
    }
    
    return variations;
  }

  private calculateCheckDigit(digits: string): string {
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
      const digit = parseInt(digits[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  private async findSimilarProducts(barcode: string): Promise<Product[]> {
    // Find products with similar barcodes or SKUs
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // Use LIKE for partial matches
    queryBuilder.where(
      'product.barcode LIKE :barcode OR product.sku LIKE :sku',
      { 
        barcode: `%${barcode.substring(0, 6)}%`,
        sku: `%${barcode}%`
      }
    );
    
    return await queryBuilder.take(5).getMany();
  }

  async processInventoryOperation(
    barcodeData: string,
    operation: InventoryOperation,
    scannerId?: string
  ): Promise<{ success: boolean; message: string; stockMovement?: StockMovement }> {
    try {
      const scanResult = await this.scanBarcode(barcodeData, scannerId, operation.location);
      
      if (!scanResult.success || !scanResult.product) {
        return {
          success: false,
          message: `Product not found for barcode: ${barcodeData}`,
        };
      }

      const product = scanResult.product;

      // Create stock movement record
      const stockMovement = this.stockMovementRepository.create({
        productId: product.id,
        type: operation.type,
        quantity: operation.quantity,
        location: operation.location,
        reason: operation.reason,
        reference: operation.reference,
        scannedBarcode: barcodeData,
        scannedBy: operation.scannedBy,
        scannedAt: new Date(),
      });

      await this.stockMovementRepository.save(stockMovement);

      // Update product stock levels
      await this.updateProductStock(product.id, operation);

      this.logger.log(
        `Processed ${operation.type} operation for ${product.name}: ${operation.quantity} units`
      );

      return {
        success: true,
        message: `Successfully processed ${operation.type} for ${product.name}`,
        stockMovement,
      };
    } catch (error) {
      this.logger.error(`Error processing inventory operation:`, error);
      
      return {
        success: false,
        message: `Operation failed: ${error.message}`,
      };
    }
  }

  private async updateProductStock(productId: string, operation: InventoryOperation): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    
    if (!product) {
      throw new Error('Product not found');
    }

    switch (operation.type) {
      case 'IN':
        product.stockQuantity += operation.quantity;
        break;
      case 'OUT':
        product.stockQuantity -= operation.quantity;
        break;
      case 'ADJUSTMENT':
        product.stockQuantity = operation.quantity;
        break;
      // TRANSFER would require more complex logic with locations
    }

    // Ensure stock doesn't go negative
    if (product.stockQuantity < 0) {
      this.logger.warn(`Negative stock for product ${product.name}: ${product.stockQuantity}`);
    }

    await this.productRepository.save(product);
  }

  async generateBarcode(
    data: string,
    options: BarcodeGenerationOptions = { type: BarcodeType.CODE_128 }
  ): Promise<Buffer> {
    // This would integrate with a barcode generation library like 'jsbarcode' or 'bwip-js'
    // For now, return a placeholder
    
    this.logger.log(`Generating ${options.type} barcode for: ${data}`);
    
    // Mock barcode generation
    const mockBarcode = Buffer.from(`Mock ${options.type} barcode for: ${data}`, 'utf-8');
    
    return mockBarcode;
  }

  async bulkScan(
    barcodes: string[],
    scannerId?: string,
    location?: string
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    
    for (const barcode of barcodes) {
      const result = await this.scanBarcode(barcode, scannerId, location);
      results.push(result);
    }
    
    return results;
  }

  async getScanHistory(
    productId?: string,
    scannerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<StockMovement[]> {
    const queryBuilder = this.stockMovementRepository.createQueryBuilder('movement');
    
    if (productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId });
    }
    
    if (scannerId) {
      queryBuilder.andWhere('movement.scannerId = :scannerId', { scannerId });
    }
    
    if (startDate) {
      queryBuilder.andWhere('movement.scannedAt >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('movement.scannedAt <= :endDate', { endDate });
    }
    
    return await queryBuilder
      .orderBy('movement.scannedAt', 'DESC')
      .getMany();
  }

  async validateBarcode(barcode: string): Promise<{ valid: boolean; type: BarcodeType; errors: string[] }> {
    const errors: string[] = [];
    const type = this.detectBarcodeType(barcode);
    
    switch (type) {
      case BarcodeType.UPC_A:
        if (!/^\d{12}$/.test(barcode)) {
          errors.push('UPC-A must be exactly 12 digits');
        } else {
          const checkDigit = this.calculateCheckDigit(barcode.substring(0, 11));
          if (checkDigit !== barcode.substring(11)) {
            errors.push('Invalid UPC-A check digit');
          }
        }
        break;
        
      case BarcodeType.EAN_13:
        if (!/^\d{13}$/.test(barcode)) {
          errors.push('EAN-13 must be exactly 13 digits');
        } else {
          const checkDigit = this.calculateCheckDigit(barcode.substring(0, 12));
          if (checkDigit !== barcode.substring(12)) {
            errors.push('Invalid EAN-13 check digit');
          }
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      type,
      errors,
    };
  }
}