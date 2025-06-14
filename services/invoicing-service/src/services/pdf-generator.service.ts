import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface InvoiceData {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  status: string;
  
  // Company Information
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    taxId?: string;
  };
  
  // Customer Information
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email?: string;
    phone?: string;
    taxId?: string;
  };
  
  // Invoice Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate?: number;
    taxAmount?: number;
  }>;
  
  // Totals
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  total: number;
  
  // Additional Information
  notes?: string;
  terms?: string;
  currency: string;
  
  // Payment Information
  paymentMethods?: Array<{
    type: string;
    details: string;
  }>;
}

export interface PDFOptions {
  template?: 'modern' | 'classic' | 'minimal';
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  includeQRCode?: boolean;
  watermark?: string;
  language?: 'en' | 'es' | 'fr' | 'de';
}

@Injectable()
export class PDFGeneratorService {
  private readonly logger = new Logger(PDFGeneratorService.name);

  constructor(private configService: ConfigService) {}

  async generateInvoicePDF(
    invoiceData: InvoiceData,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoiceData.number}`,
          Author: invoiceData.company.name,
          Subject: `Invoice for ${invoiceData.customer.name}`,
          Creator: 'NextCore ERP',
        },
      });

      // Create buffer to store PDF
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      
      const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });

      // Generate PDF content based on template
      switch (options.template || 'modern') {
        case 'modern':
          await this.generateModernTemplate(doc, invoiceData, options);
          break;
        case 'classic':
          await this.generateClassicTemplate(doc, invoiceData, options);
          break;
        case 'minimal':
          await this.generateMinimalTemplate(doc, invoiceData, options);
          break;
        default:
          await this.generateModernTemplate(doc, invoiceData, options);
      }

      doc.end();
      
      const pdfBuffer = await pdfPromise;
      this.logger.log(`Generated PDF for invoice ${invoiceData.number}`);
      
      return pdfBuffer;
    } catch (error) {
      this.logger.error(`Error generating PDF for invoice ${invoiceData.number}:`, error);
      throw error;
    }
  }

  private async generateModernTemplate(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    options: PDFOptions
  ): Promise<void> {
    const primaryColor = this.getColorScheme(options.colorScheme || 'blue').primary;
    const secondaryColor = this.getColorScheme(options.colorScheme || 'blue').secondary;

    // Header with company logo and info
    await this.addHeader(doc, data, primaryColor);
    
    // Invoice title and details
    this.addInvoiceTitle(doc, data, primaryColor);
    
    // Customer and company information
    this.addBillingInformation(doc, data);
    
    // Invoice items table
    this.addItemsTable(doc, data, primaryColor, secondaryColor);
    
    // Totals section
    this.addTotalsSection(doc, data, primaryColor);
    
    // Payment information
    this.addPaymentInformation(doc, data);
    
    // Notes and terms
    this.addNotesAndTerms(doc, data);
    
    // Footer
    this.addFooter(doc, data, primaryColor);
    
    // QR Code if requested
    if (options.includeQRCode) {
      await this.addQRCode(doc, data);
    }
    
    // Watermark if specified
    if (options.watermark) {
      this.addWatermark(doc, options.watermark);
    }
  }

  private async generateClassicTemplate(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    options: PDFOptions
  ): Promise<void> {
    // Classic template with traditional layout
    doc.fontSize(20).text('INVOICE', 50, 50);
    
    // Company information
    doc.fontSize(12)
       .text(data.company.name, 50, 100)
       .text(data.company.address, 50, 115)
       .text(`${data.company.city}, ${data.company.state} ${data.company.zipCode}`, 50, 130);

    // Invoice details
    doc.text(`Invoice #: ${data.number}`, 400, 100)
       .text(`Date: ${data.date.toLocaleDateString()}`, 400, 115)
       .text(`Due Date: ${data.dueDate.toLocaleDateString()}`, 400, 130);

    // Customer information
    doc.text('Bill To:', 50, 180)
       .text(data.customer.name, 50, 195)
       .text(data.customer.address, 50, 210)
       .text(`${data.customer.city}, ${data.customer.state} ${data.customer.zipCode}`, 50, 225);

    // Items table
    let yPosition = 280;
    doc.text('Description', 50, yPosition)
       .text('Qty', 300, yPosition)
       .text('Price', 350, yPosition)
       .text('Amount', 450, yPosition);

    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    data.items.forEach((item) => {
      doc.text(item.description, 50, yPosition)
         .text(item.quantity.toString(), 300, yPosition)
         .text(`$${item.unitPrice.toFixed(2)}`, 350, yPosition)
         .text(`$${item.amount.toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    });

    // Totals
    yPosition += 20;
    doc.text(`Subtotal: $${data.subtotal.toFixed(2)}`, 400, yPosition);
    yPosition += 15;
    doc.text(`Tax: $${data.taxTotal.toFixed(2)}`, 400, yPosition);
    yPosition += 15;
    doc.fontSize(14).text(`Total: $${data.total.toFixed(2)}`, 400, yPosition);
  }

  private async generateMinimalTemplate(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    options: PDFOptions
  ): Promise<void> {
    // Minimal template with clean, simple design
    doc.fontSize(24).text('Invoice', 50, 50);
    
    // Basic information in a clean layout
    doc.fontSize(10)
       .text(`#${data.number}`, 50, 90)
       .text(data.date.toLocaleDateString(), 50, 105);

    // Simple items list
    let yPosition = 150;
    data.items.forEach((item) => {
      doc.text(`${item.description} × ${item.quantity}`, 50, yPosition)
         .text(`$${item.amount.toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    });

    // Simple total
    yPosition += 20;
    doc.fontSize(14).text(`Total: $${data.total.toFixed(2)}`, 50, yPosition);
  }

  private async addHeader(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    primaryColor: string
  ): Promise<void> {
    // Add company logo if available
    if (data.company.logo && fs.existsSync(data.company.logo)) {
      doc.image(data.company.logo, 50, 50, { width: 100 });
    }

    // Company information
    doc.fillColor(primaryColor)
       .fontSize(18)
       .text(data.company.name, 200, 50);

    doc.fillColor('black')
       .fontSize(10)
       .text(data.company.address, 200, 75)
       .text(`${data.company.city}, ${data.company.state} ${data.company.zipCode}`, 200, 90)
       .text(data.company.country, 200, 105);

    if (data.company.phone) {
      doc.text(`Phone: ${data.company.phone}`, 200, 120);
    }
    if (data.company.email) {
      doc.text(`Email: ${data.company.email}`, 200, 135);
    }
  }

  private addInvoiceTitle(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    primaryColor: string
  ): void {
    doc.fillColor(primaryColor)
       .fontSize(24)
       .text('INVOICE', 400, 50);

    doc.fillColor('black')
       .fontSize(12)
       .text(`Invoice #: ${data.number}`, 400, 85)
       .text(`Date: ${data.date.toLocaleDateString()}`, 400, 100)
       .text(`Due Date: ${data.dueDate.toLocaleDateString()}`, 400, 115)
       .text(`Status: ${data.status.toUpperCase()}`, 400, 130);
  }

  private addBillingInformation(
    doc: PDFKit.PDFDocument,
    data: InvoiceData
  ): void {
    // Bill To section
    doc.fontSize(12)
       .text('BILL TO:', 50, 180);

    doc.fontSize(10)
       .text(data.customer.name, 50, 200)
       .text(data.customer.address, 50, 215)
       .text(`${data.customer.city}, ${data.customer.state} ${data.customer.zipCode}`, 50, 230)
       .text(data.customer.country, 50, 245);

    if (data.customer.email) {
      doc.text(`Email: ${data.customer.email}`, 50, 260);
    }
    if (data.customer.phone) {
      doc.text(`Phone: ${data.customer.phone}`, 50, 275);
    }
  }

  private addItemsTable(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    primaryColor: string,
    secondaryColor: string
  ): void {
    const tableTop = 320;
    const tableLeft = 50;
    const tableWidth = 500;

    // Table header
    doc.rect(tableLeft, tableTop, tableWidth, 25)
       .fillAndStroke(primaryColor, primaryColor);

    doc.fillColor('white')
       .fontSize(10)
       .text('DESCRIPTION', tableLeft + 10, tableTop + 8)
       .text('QTY', tableLeft + 300, tableTop + 8)
       .text('PRICE', tableLeft + 350, tableTop + 8)
       .text('AMOUNT', tableLeft + 450, tableTop + 8);

    // Table rows
    let yPosition = tableTop + 25;
    data.items.forEach((item, index) => {
      const rowColor = index % 2 === 0 ? 'white' : secondaryColor;
      
      doc.rect(tableLeft, yPosition, tableWidth, 20)
         .fillAndStroke(rowColor, 'lightgray');

      doc.fillColor('black')
         .text(item.description, tableLeft + 10, yPosition + 5)
         .text(item.quantity.toString(), tableLeft + 300, yPosition + 5)
         .text(`${data.currency} ${item.unitPrice.toFixed(2)}`, tableLeft + 350, yPosition + 5)
         .text(`${data.currency} ${item.amount.toFixed(2)}`, tableLeft + 450, yPosition + 5);

      yPosition += 20;
    });
  }

  private addTotalsSection(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    primaryColor: string
  ): void {
    const totalsLeft = 350;
    let yPosition = 500;

    doc.fontSize(10)
       .text(`Subtotal: ${data.currency} ${data.subtotal.toFixed(2)}`, totalsLeft, yPosition);
    
    yPosition += 15;
    if (data.discountTotal && data.discountTotal > 0) {
      doc.text(`Discount: -${data.currency} ${data.discountTotal.toFixed(2)}`, totalsLeft, yPosition);
      yPosition += 15;
    }
    
    doc.text(`Tax: ${data.currency} ${data.taxTotal.toFixed(2)}`, totalsLeft, yPosition);
    
    yPosition += 20;
    doc.rect(totalsLeft - 10, yPosition - 5, 200, 25)
       .fillAndStroke(primaryColor, primaryColor);

    doc.fillColor('white')
       .fontSize(12)
       .text(`TOTAL: ${data.currency} ${data.total.toFixed(2)}`, totalsLeft, yPosition + 5);
  }

  private addPaymentInformation(
    doc: PDFKit.PDFDocument,
    data: InvoiceData
  ): void {
    if (data.paymentMethods && data.paymentMethods.length > 0) {
      doc.fillColor('black')
         .fontSize(12)
         .text('PAYMENT INFORMATION:', 50, 580);

      let yPosition = 600;
      data.paymentMethods.forEach((method) => {
        doc.fontSize(10)
           .text(`${method.type}: ${method.details}`, 50, yPosition);
        yPosition += 15;
      });
    }
  }

  private addNotesAndTerms(
    doc: PDFKit.PDFDocument,
    data: InvoiceData
  ): void {
    let yPosition = 650;

    if (data.notes) {
      doc.fontSize(12).text('NOTES:', 50, yPosition);
      yPosition += 20;
      doc.fontSize(10).text(data.notes, 50, yPosition, { width: 500 });
      yPosition += 40;
    }

    if (data.terms) {
      doc.fontSize(12).text('TERMS & CONDITIONS:', 50, yPosition);
      yPosition += 20;
      doc.fontSize(10).text(data.terms, 50, yPosition, { width: 500 });
    }
  }

  private addFooter(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    primaryColor: string
  ): void {
    const footerY = 750;
    
    doc.rect(50, footerY, 500, 1)
       .fillAndStroke(primaryColor, primaryColor);

    doc.fillColor('gray')
       .fontSize(8)
       .text('Generated by NextCore ERP', 50, footerY + 10)
       .text(`Page 1 of 1`, 450, footerY + 10);

    if (data.company.website) {
      doc.text(data.company.website, 250, footerY + 10);
    }
  }

  private async addQRCode(
    doc: PDFKit.PDFDocument,
    data: InvoiceData
  ): Promise<void> {
    // QR code would contain payment information or invoice URL
    const qrData = JSON.stringify({
      invoice: data.number,
      amount: data.total,
      currency: data.currency,
      dueDate: data.dueDate.toISOString(),
    });

    // This would require a QR code library like 'qrcode'
    // For now, just add a placeholder
    doc.fontSize(8)
       .text('QR Code for payment', 450, 200);
  }

  private addWatermark(
    doc: PDFKit.PDFDocument,
    watermarkText: string
  ): void {
    doc.save();
    doc.rotate(45, { origin: [300, 400] })
       .fillColor('lightgray')
       .fontSize(72)
       .opacity(0.1)
       .text(watermarkText, 200, 350);
    doc.restore();
  }

  private getColorScheme(scheme: string): { primary: string; secondary: string } {
    const schemes = {
      blue: { primary: '#2563eb', secondary: '#eff6ff' },
      green: { primary: '#059669', secondary: '#ecfdf5' },
      red: { primary: '#dc2626', secondary: '#fef2f2' },
      purple: { primary: '#7c3aed', secondary: '#f3e8ff' },
      orange: { primary: '#ea580c', secondary: '#fff7ed' },
    };

    return schemes[scheme] || schemes.blue;
  }

  async saveInvoicePDF(
    invoiceData: InvoiceData,
    filePath: string,
    options: PDFOptions = {}
  ): Promise<string> {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoiceData, options);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, pdfBuffer);
      
      this.logger.log(`Saved PDF to ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Error saving PDF to ${filePath}:`, error);
      throw error;
    }
  }
}