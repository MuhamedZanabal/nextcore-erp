import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateCategory {
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  DATA_PROCESSING = 'data_processing',
  INTEGRATION = 'integration',
  AUTOMATION = 'automation',
  REPORTING = 'reporting',
}

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
  })
  category: TemplateCategory;

  @Column({ type: 'jsonb' })
  definition: any; // Template workflow definition

  @Column({ type: 'jsonb', nullable: true })
  default_config: any; // Default configuration

  @Column({ type: 'varchar', length: 100, nullable: true })
  tags: string;

  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}