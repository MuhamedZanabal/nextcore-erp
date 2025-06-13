import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';

@Entity('leads')
export class Lead {
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

  @Column({ default: 'new' })
  status: string; // new, qualified, unqualified, converted

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  campaignId: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}