import { IsString, IsOptional, IsEnum, IsObject, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkflowStatus, TriggerType } from '../entities/workflow.entity';

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TriggerType, description: 'Trigger type' })
  @IsEnum(TriggerType)
  trigger_type: TriggerType;

  @ApiPropertyOptional({ description: 'Trigger configuration' })
  @IsOptional()
  @IsObject()
  trigger_config?: any;

  @ApiProperty({ description: 'Workflow definition with nodes and connections' })
  @IsObject()
  definition: any;

  @ApiPropertyOptional({ description: 'Default variables' })
  @IsOptional()
  @IsObject()
  variables?: any;

  @ApiPropertyOptional({ description: 'Workflow category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Workflow tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ description: 'Creator user ID' })
  @IsUUID()
  created_by: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  @IsUUID()
  tenant_id?: string;
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: 'Workflow name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: WorkflowStatus, description: 'Workflow status' })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ enum: TriggerType, description: 'Trigger type' })
  @IsOptional()
  @IsEnum(TriggerType)
  trigger_type?: TriggerType;

  @ApiPropertyOptional({ description: 'Trigger configuration' })
  @IsOptional()
  @IsObject()
  trigger_config?: any;

  @ApiPropertyOptional({ description: 'Workflow definition' })
  @IsOptional()
  @IsObject()
  definition?: any;

  @ApiPropertyOptional({ description: 'Default variables' })
  @IsOptional()
  @IsObject()
  variables?: any;

  @ApiPropertyOptional({ description: 'Workflow category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Workflow tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Updater user ID' })
  @IsOptional()
  @IsUUID()
  updated_by?: string;
}

export class ExecuteWorkflowDto {
  @ApiPropertyOptional({ description: 'Input data for workflow execution' })
  @IsOptional()
  @IsObject()
  inputData?: any;

  @ApiPropertyOptional({ description: 'User ID who triggered the workflow' })
  @IsOptional()
  @IsUUID()
  triggeredBy?: string;

  @ApiPropertyOptional({ description: 'Source that triggered the workflow' })
  @IsOptional()
  @IsString()
  triggerSource?: string;
}

export class WorkflowNodeDto {
  @ApiProperty({ description: 'Node ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Node type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Node name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Node configuration' })
  @IsObject()
  config: any;

  @ApiProperty({ description: 'Node position' })
  @IsObject()
  position: { x: number; y: number };

  @ApiProperty({ description: 'Input connections' })
  @IsArray()
  inputs: string[];

  @ApiProperty({ description: 'Output connections' })
  @IsArray()
  outputs: string[];
}

export class WorkflowConnectionDto {
  @ApiProperty({ description: 'Connection ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Source node ID' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Target node ID' })
  @IsString()
  target: string;

  @ApiPropertyOptional({ description: 'Connection condition' })
  @IsOptional()
  @IsString()
  condition?: string;
}

export class WorkflowDefinitionDto {
  @ApiProperty({ type: [WorkflowNodeDto], description: 'Workflow nodes' })
  @IsArray()
  nodes: WorkflowNodeDto[];

  @ApiProperty({ type: [WorkflowConnectionDto], description: 'Node connections' })
  @IsArray()
  connections: WorkflowConnectionDto[];

  @ApiProperty({ description: 'Workflow variables' })
  @IsObject()
  variables: Record<string, any>;
}