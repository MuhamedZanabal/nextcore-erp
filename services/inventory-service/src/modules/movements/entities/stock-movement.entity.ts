import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { StockMovementLine } from './stock-movement-line.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  reference: string;

  @Column()
  type: string; // receipt, shipment, transfer, adjustment, production, consumption

  @Column({ nullable: true })
  sourceWarehouseId: string;

  @Column({ nullable: true })
  destinationWarehouseId: string;

  @Column({ default: 'draft' })
  status: string; // draft, confirmed, processing, completed, cancelled

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdById: string;

  @OneToMany(() => StockMovementLine, line => line.movement, { cascade: true })
  lines: StockMovementLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}