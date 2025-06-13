import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('stock_levels')
@Index(['productId', 'warehouseId'], { unique: true })
export class StockLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.stockLevels)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  warehouseId: string;

  @Column({ nullable: true })
  binId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCounted: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}