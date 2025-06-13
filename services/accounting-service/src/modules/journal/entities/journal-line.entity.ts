import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';

@Entity('journal_lines')
export class JournalLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  journalEntryId: string;

  @ManyToOne(() => JournalEntry, journalEntry => journalEntry.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @Column()
  accountId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @Column({ nullable: true })
  costCenterId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ type: 'json', nullable: true })
  dimensions: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}