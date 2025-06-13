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
  action: string; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.

  @Column()
  resource: string; // contact, lead, opportunity, etc.

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  newValues: Record<string, any>;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}