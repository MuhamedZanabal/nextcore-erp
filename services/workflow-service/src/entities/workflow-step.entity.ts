import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkflowExecution } from './workflow-execution.entity';

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum StepType {
  START = 'start',
  END = 'end',
  ACTION = 'action',
  CONDITION = 'condition',
  LOOP = 'loop',
  DELAY = 'delay',
  SCRIPT = 'script',
  HTTP_REQUEST = 'http_request',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  DATABASE = 'database',
  APPROVAL = 'approval',
}

@Entity('workflow_steps')
export class WorkflowStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  execution_id: string;

  @Column({ type: 'varchar', length: 100 })
  step_id: string; // Reference to step in workflow definition

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: StepType,
  })
  type: StepType;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ type: 'jsonb', nullable: true })
  input_data: any;

  @Column({ type: 'jsonb', nullable: true })
  output_data: any;

  @Column({ type: 'jsonb', nullable: true })
  config: any; // Step configuration

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'jsonb', nullable: true })
  error_details: any;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'int', default: 0 })
  execution_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => WorkflowExecution, (execution) => execution.steps)
  @JoinColumn({ name: 'execution_id' })
  execution: WorkflowExecution;
}