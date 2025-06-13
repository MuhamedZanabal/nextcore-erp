import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { StockLevel } from './stock-level.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  listPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: true })
  trackInventory: boolean;

  @Column({ default: 'fifo' })
  inventoryMethod: string; // fifo, lifo, average

  @Column({ default: false })
  trackSerialNumbers: boolean;

  @Column({ default: false })
  trackLots: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorderPoint: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorderQuantity: number;

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => StockLevel, stockLevel => stockLevel.product)
  stockLevels: StockLevel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}