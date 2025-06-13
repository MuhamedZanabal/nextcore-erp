import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ default: 'active' })
  status: string; // active, inactive, terminated

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  positionId: string;

  @Column({ nullable: true })
  managerId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseSalary: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'monthly' })
  payFrequency: string; // weekly, biweekly, monthly, annually

  @Column({ type: 'json', nullable: true })
  personalInfo: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  emergencyContacts: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  bankDetails: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}