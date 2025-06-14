import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WorkflowExecution } from './workflow-execution.entity';

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  WEBHOOK = 'webhook',
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column({
    type: 'enum',
    enum: TriggerType,
    default: TriggerType.MANUAL,
  })
  trigger_type: TriggerType;

  @Column({ type: 'jsonb', nullable: true })
  trigger_config: any;

  @Column({ type: 'jsonb' })
  definition: any; // Workflow definition with nodes and connections

  @Column({ type: 'jsonb', nullable: true })
  variables: any; // Default variables for the workflow

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tags: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => WorkflowExecution, (execution) => execution.workflow)
  executions: WorkflowExecution[];
}