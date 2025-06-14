import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Workflow, WorkflowStatus } from '../entities/workflow.entity';
import { WorkflowExecution } from '../entities/workflow-execution.entity';
import { WorkflowTemplate } from '../entities/workflow-template.entity';
import { WorkflowEngineService } from '../services/workflow-engine.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from '../dto/workflow.dto';

@ApiTags('workflows')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private executionRepository: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowTemplate)
    private templateRepository: Repository<WorkflowTemplate>,
    private workflowEngine: WorkflowEngineService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async findAll(
    @Query('status') status?: WorkflowStatus,
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

    if (status) {
      queryBuilder.andWhere('workflow.status = :status', { status });
    }

    if (category) {
      queryBuilder.andWhere('workflow.category = :category', { category });
    }

    const [workflows, total] = await queryBuilder
      .orderBy('workflow.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: workflows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  async findOne(@Param('id') id: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
      relations: ['executions'],
    });

    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }

    return workflow;
  }

  @Post()
  @ApiOperation({ summary: 'Create new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(@Body() createWorkflowDto: CreateWorkflowDto) {
    const workflow = this.workflowRepository.create(createWorkflowDto);
    return await this.workflowRepository.save(workflow);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  async update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    const workflow = await this.workflowRepository.findOne({ where: { id } });

    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(workflow, updateWorkflowDto);
    return await this.workflowRepository.save(workflow);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  async remove(@Param('id') id: string) {
    const result = await this.workflowRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Workflow deleted successfully' };
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  @ApiResponse({ status: 200, description: 'Workflow execution started' })
  async execute(@Param('id') id: string, @Body() executeDto: ExecuteWorkflowDto) {
    try {
      const execution = await this.workflowEngine.executeWorkflow(
        id,
        executeDto.inputData,
        executeDto.triggeredBy,
        executeDto.triggerSource,
      );

      return {
        message: 'Workflow execution started',
        executionId: execution.id,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate workflow' })
  @ApiResponse({ status: 200, description: 'Workflow activated successfully' })
  async activate(@Param('id') id: string) {
    const workflow = await this.workflowRepository.findOne({ where: { id } });

    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }

    workflow.status = WorkflowStatus.ACTIVE;
    await this.workflowRepository.save(workflow);

    // Schedule if it has a cron trigger
    if (workflow.trigger_type === 'scheduled' && workflow.trigger_config?.cron) {
      await this.workflowEngine.scheduleWorkflow(id, workflow.trigger_config.cron);
    }

    return { message: 'Workflow activated successfully' };
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deactivated successfully' })
  async deactivate(@Param('id') id: string) {
    const workflow = await this.workflowRepository.findOne({ where: { id } });

    if (!workflow) {
      throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
    }

    workflow.status = WorkflowStatus.INACTIVE;
    await this.workflowRepository.save(workflow);

    // Unschedule if it was scheduled
    await this.workflowEngine.unscheduleWorkflow(id);

    return { message: 'Workflow deactivated successfully' };
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get workflow executions' })
  @ApiResponse({ status: 200, description: 'List of workflow executions' })
  async getExecutions(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const [executions, total] = await this.executionRepository.findAndCount({
      where: { workflow_id: id },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['steps'],
    });

    return {
      data: executions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get execution details' })
  @ApiResponse({ status: 200, description: 'Execution details' })
  async getExecution(@Param('executionId') executionId: string) {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId },
      relations: ['workflow', 'steps'],
    });

    if (!execution) {
      throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
    }

    return execution;
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get workflow templates' })
  @ApiResponse({ status: 200, description: 'List of workflow templates' })
  async getTemplates(
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const queryBuilder = this.templateRepository.createQueryBuilder('template');

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    const [templates, total] = await queryBuilder
      .where('template.is_public = :isPublic', { isPublic: true })
      .orderBy('template.usage_count', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('templates/:templateId/create')
  @ApiOperation({ summary: 'Create workflow from template' })
  @ApiResponse({ status: 201, description: 'Workflow created from template' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body() createDto: { name: string; description?: string; config?: any },
  ) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }

    const workflow = this.workflowRepository.create({
      name: createDto.name,
      description: createDto.description || template.description,
      definition: template.definition,
      variables: { ...template.default_config, ...createDto.config },
      category: template.category,
      created_by: 'current-user-id', // TODO: Get from auth context
    });

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // Increment template usage count
    template.usage_count += 1;
    await this.templateRepository.save(template);

    return savedWorkflow;
  }
}