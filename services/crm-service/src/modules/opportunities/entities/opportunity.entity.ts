import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  contactId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'prospecting' })
  stage: string; // prospecting, qualification, proposal, negotiation, closed-won, closed-lost

  @Column({ type: 'float', default: 0 })
  probability: number;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}