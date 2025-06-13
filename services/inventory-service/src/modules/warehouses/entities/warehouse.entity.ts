import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { WarehouseZone } from './warehouse-zone.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'json', nullable: true })
  operatingHours: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  capabilities: string[];

  @OneToMany(() => WarehouseZone, zone => zone.warehouse, { cascade: true })
  zones: WarehouseZone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}