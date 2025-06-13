import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { JournalLine } from './journal-line.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  reference: string;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ nullable: true })
  fiscalPeriodId: string;

  @Column({ default: 'draft' })
  status: string; // draft, posted, cancelled

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  sourceDocumentType: string;

  @Column({ nullable: true })
  sourceDocumentId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @Column({ nullable: true })
  createdById: string;

  @Column({ nullable: true })
  postedById: string;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @OneToMany(() => JournalLine, line => line.journalEntry, { cascade: true })
  lines: JournalLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}