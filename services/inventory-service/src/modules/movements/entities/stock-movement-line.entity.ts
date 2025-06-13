import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StockMovement } from './stock-movement.entity';

@Entity('stock_movement_lines')
export class StockMovementLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  movementId: string;

  @ManyToOne(() => StockMovement, movement => movement.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movementId' })
  movement: StockMovement;

  @Column()
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ nullable: true })
  sourceBinId: string;

  @Column({ nullable: true })
  destinationBinId: string;

  @Column({ nullable: true })
  lotId: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}