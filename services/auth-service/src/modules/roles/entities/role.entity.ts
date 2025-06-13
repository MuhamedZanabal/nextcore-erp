import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @Column({ default: false })
  isSystemRole: boolean;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Column({ nullable: false })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}