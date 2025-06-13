import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column()
  action: string; // create, read, update, delete, login, logout, etc.

  @Column()
  resource: string; // contact, lead, invoice, etc.

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}