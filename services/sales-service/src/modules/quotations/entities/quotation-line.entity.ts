import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity('quotation_lines')
export class QuotationLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationId: string;

  @ManyToOne(() => Quotation, quotation => quotation.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column()
  productId: string;

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