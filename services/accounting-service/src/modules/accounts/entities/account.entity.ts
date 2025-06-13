import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  type: string; // asset, liability, equity, revenue, expense

  @Column()
  category: string; // current_asset, fixed_asset, current_liability, etc.

  @Column({ default: false })
  isBankAccount: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Account, account => account.children)
  @JoinColumn({ name: 'parentId' })
  parent: Account;

  @OneToMany(() => Account, account => account.parent)
  children: Account[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}