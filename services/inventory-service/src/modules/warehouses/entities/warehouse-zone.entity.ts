import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseBin } from './warehouse-bin.entity';

@Entity('warehouse_zones')
export class WarehouseZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.zones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'general' })
  zoneType: string; // general, receiving, shipping, picking, etc.

  @OneToMany(() => WarehouseBin, bin => bin.zone, { cascade: true })
  bins: WarehouseBin[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}