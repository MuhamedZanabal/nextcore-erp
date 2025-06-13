import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WarehouseZone } from './warehouse-zone.entity';

@Entity('warehouse_bins')
export class WarehouseBin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  zoneId: string;

  @ManyToOne(() => WarehouseZone, zone => zone.bins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zoneId' })
  zone: WarehouseZone;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacity: number;

  @Column({ nullable: true })
  capacityUnit: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}