import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('security_events')
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column()
  eventType: string; // failed_login, suspicious_activity, data_breach, etc.

  @Column()
  severity: string; // low, medium, high, critical

  @Column()
  description: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ default: false })
  resolved: boolean;

  @Column({ nullable: true })
  resolvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}