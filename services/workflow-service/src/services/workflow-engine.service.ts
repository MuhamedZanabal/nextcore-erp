import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { VM } from 'vm2';
import * as jp from 'jsonpath';
import * as _ from 'lodash';

import { Workflow, WorkflowStatus } from '../entities/workflow.entity';
import { WorkflowExecution, ExecutionStatus } from '../entities/workflow-execution.entity';
import { WorkflowStep, StepStatus, StepType } from '../entities/workflow-step.entity';
import { RedisService } from './redis.service';
import { NatsService } from './nats.service';

export interface WorkflowNode {
  id: string;
  type: StepType;
  name: string;
  config: any;
  position: { x: number; y: number };
  inputs: string[];
  outputs: string[];
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private executionRepository: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowStep)
    private stepRepository: Repository<WorkflowStep>,
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    private redisService: RedisService,
    private natsService: NatsService,
  ) {}

  async executeWorkflow(
    workflowId: string,
    inputData: any = {},
    triggeredBy?: string,
    triggerSource?: string,
  ): Promise<WorkflowExecution> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId, status: WorkflowStatus.ACTIVE },
    });

    if (!workflow) {
      throw new Error(`Active workflow with ID ${workflowId} not found`);
    }

    // Create execution record
    const execution = this.executionRepository.create({
      workflow_id: workflowId,
      status: ExecutionStatus.PENDING,
      input_data: inputData,
      context: { ...workflow.variables, ...inputData },
      triggered_by: triggeredBy,
      trigger_source: triggerSource,
      tenant_id: workflow.tenant_id,
    });

    const savedExecution = await this.executionRepository.save(execution);

    // Start execution asynchronously
    this.processExecution(savedExecution.id, workflow.definition);

    return savedExecution;
  }

  private async processExecution(executionId: string, definition: WorkflowDefinition): Promise<void> {
    try {
      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      // Update execution status
      execution.status = ExecutionStatus.RUNNING;
      execution.started_at = new Date();
      await this.executionRepository.save(execution);

      // Find start node
      const startNode = definition.nodes.find(node => node.type === StepType.START);
      if (!startNode) {
        throw new Error('No start node found in workflow definition');
      }

      // Execute workflow
      const result = await this.executeNode(startNode, definition, execution);

      // Update execution with final result
      execution.status = ExecutionStatus.COMPLETED;
      execution.completed_at = new Date();
      execution.output_data = result;
      await this.executionRepository.save(execution);

      // Emit completion event
      this.eventEmitter.emit('workflow.completed', {
        executionId,
        workflowId: execution.workflow_id,
        result,
      });

    } catch (error) {
      this.logger.error(`Workflow execution ${executionId} failed:`, error);
      
      // Update execution with error
      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
      });
      
      if (execution) {
        execution.status = ExecutionStatus.FAILED;
        execution.completed_at = new Date();
        execution.error_message = error.message;
        execution.error_details = { stack: error.stack };
        await this.executionRepository.save(execution);
      }

      // Emit error event
      this.eventEmitter.emit('workflow.failed', {
        executionId,
        error: error.message,
      });
    }
  }

  private async executeNode(
    node: WorkflowNode,
    definition: WorkflowDefinition,
    execution: WorkflowExecution,
    context: any = {},
  ): Promise<any> {
    // Create step record
    const step = this.stepRepository.create({
      execution_id: execution.id,
      step_id: node.id,
      name: node.name,
      type: node.type,
      status: StepStatus.RUNNING,
      config: node.config,
      started_at: new Date(),
    });

    const savedStep = await this.stepRepository.save(step);

    try {
      let result: any;

      // Execute based on node type
      switch (node.type) {
        case StepType.START:
          result = execution.input_data;
          break;

        case StepType.END:
          result = context;
          break;

        case StepType.ACTION:
          result = await this.executeAction(node, context);
          break;

        case StepType.CONDITION:
          result = await this.executeCondition(node, context);
          break;

        case StepType.SCRIPT:
          result = await this.executeScript(node, context);
          break;

        case StepType.HTTP_REQUEST:
          result = await this.executeHttpRequest(node, context);
          break;

        case StepType.EMAIL:
          result = await this.executeEmail(node, context);
          break;

        case StepType.DELAY:
          result = await this.executeDelay(node, context);
          break;

        case StepType.DATABASE:
          result = await this.executeDatabase(node, context);
          break;

        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      // Update step with success
      savedStep.status = StepStatus.COMPLETED;
      savedStep.completed_at = new Date();
      savedStep.output_data = result;
      await this.stepRepository.save(savedStep);

      // Continue to next nodes if not end node
      if (node.type !== StepType.END) {
        const nextNodes = this.getNextNodes(node, definition, result);
        
        for (const nextNode of nextNodes) {
          await this.executeNode(nextNode, definition, execution, { ...context, ...result });
        }
      }

      return result;

    } catch (error) {
      // Update step with error
      savedStep.status = StepStatus.FAILED;
      savedStep.completed_at = new Date();
      savedStep.error_message = error.message;
      savedStep.error_details = { stack: error.stack };
      await this.stepRepository.save(savedStep);

      throw error;
    }
  }

  private getNextNodes(
    currentNode: WorkflowNode,
    definition: WorkflowDefinition,
    result: any,
  ): WorkflowNode[] {
    const connections = definition.connections.filter(conn => conn.source === currentNode.id);
    const nextNodes: WorkflowNode[] = [];

    for (const connection of connections) {
      // Check condition if present
      if (connection.condition) {
        const conditionResult = this.evaluateCondition(connection.condition, result);
        if (!conditionResult) continue;
      }

      const nextNode = definition.nodes.find(node => node.id === connection.target);
      if (nextNode) {
        nextNodes.push(nextNode);
      }
    }

    return nextNodes;
  }

  private async executeAction(node: WorkflowNode, context: any): Promise<any> {
    const { action, parameters } = node.config;
    
    // Resolve parameters with context
    const resolvedParams = this.resolveParameters(parameters, context);

    // Emit action event for external handlers
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Action ${action} timed out`));
      }, 30000);

      this.eventEmitter.emit('workflow.action', {
        action,
        parameters: resolvedParams,
        context,
        callback: (error: any, result: any) => {
          clearTimeout(timeout);
          if (error) reject(error);
          else resolve(result);
        },
      });
    });

    return result;
  }

  private async executeCondition(node: WorkflowNode, context: any): Promise<any> {
    const { condition } = node.config;
    const result = this.evaluateCondition(condition, context);
    return { condition_result: result, ...context };
  }

  private async executeScript(node: WorkflowNode, context: any): Promise<any> {
    const { script, language = 'javascript' } = node.config;

    if (language === 'javascript') {
      const vm = new VM({
        timeout: 10000,
        sandbox: {
          context,
          console: {
            log: (...args: any[]) => this.logger.log('Script:', ...args),
          },
          _: _,
          jp: jp,
        },
      });

      const result = vm.run(script);
      return result;
    }

    throw new Error(`Unsupported script language: ${language}`);
  }

  private async executeHttpRequest(node: WorkflowNode, context: any): Promise<any> {
    const { method, url, headers, body } = node.config;
    
    const resolvedUrl = this.resolveTemplate(url, context);
    const resolvedHeaders = this.resolveParameters(headers, context);
    const resolvedBody = this.resolveParameters(body, context);

    // Use fetch or axios for HTTP requests
    const response = await fetch(resolvedUrl, {
      method,
      headers: resolvedHeaders,
      body: method !== 'GET' ? JSON.stringify(resolvedBody) : undefined,
    });

    const result = await response.json();
    return { status: response.status, data: result };
  }

  private async executeEmail(node: WorkflowNode, context: any): Promise<any> {
    const { to, subject, body, template } = node.config;
    
    const resolvedTo = this.resolveTemplate(to, context);
    const resolvedSubject = this.resolveTemplate(subject, context);
    const resolvedBody = this.resolveTemplate(body, context);

    // Emit email event for external email service
    this.eventEmitter.emit('workflow.email', {
      to: resolvedTo,
      subject: resolvedSubject,
      body: resolvedBody,
      template,
      context,
    });

    return { email_sent: true, to: resolvedTo };
  }

  private async executeDelay(node: WorkflowNode, context: any): Promise<any> {
    const { duration } = node.config; // duration in milliseconds
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return { delayed: duration, ...context };
  }

  private async executeDatabase(node: WorkflowNode, context: any): Promise<any> {
    const { operation, table, data, conditions } = node.config;
    
    // Emit database event for external database service
    const result = await new Promise((resolve, reject) => {
      this.eventEmitter.emit('workflow.database', {
        operation,
        table,
        data: this.resolveParameters(data, context),
        conditions: this.resolveParameters(conditions, context),
        callback: (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        },
      });
    });

    return result;
  }

  private evaluateCondition(condition: string, context: any): boolean {
    try {
      const vm = new VM({
        timeout: 5000,
        sandbox: { context, _: _, jp: jp },
      });

      return vm.run(`(function() { return ${condition}; })()`);
    } catch (error) {
      this.logger.error('Condition evaluation error:', error);
      return false;
    }
  }

  private resolveParameters(params: any, context: any): any {
    if (typeof params === 'string') {
      return this.resolveTemplate(params, context);
    }

    if (Array.isArray(params)) {
      return params.map(param => this.resolveParameters(param, context));
    }

    if (typeof params === 'object' && params !== null) {
      const resolved: any = {};
      for (const [key, value] of Object.entries(params)) {
        resolved[key] = this.resolveParameters(value, context);
      }
      return resolved;
    }

    return params;
  }

  private resolveTemplate(template: string, context: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      try {
        const value = jp.value(context, `$.${path.trim()}`);
        return value !== undefined ? String(value) : match;
      } catch {
        return match;
      }
    });
  }

  async scheduleWorkflow(workflowId: string, cronExpression: string): Promise<void> {
    const job = new CronJob(cronExpression, () => {
      this.executeWorkflow(workflowId, {}, 'system', 'scheduler');
    });

    this.schedulerRegistry.addCronJob(`workflow_${workflowId}`, job);
    job.start();

    this.logger.log(`Scheduled workflow ${workflowId} with cron: ${cronExpression}`);
  }

  async unscheduleWorkflow(workflowId: string): Promise<void> {
    try {
      this.schedulerRegistry.deleteCronJob(`workflow_${workflowId}`);
      this.logger.log(`Unscheduled workflow ${workflowId}`);
    } catch (error) {
      this.logger.warn(`Failed to unschedule workflow ${workflowId}:`, error);
    }
  }
}