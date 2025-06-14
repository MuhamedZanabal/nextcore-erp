import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { Lead } from '../entities/lead.entity';
import { Activity } from '../entities/activity.entity';

export interface LeadScoringCriteria {
  demographic: {
    companySize?: number;
    industry?: string;
    jobTitle?: string;
    location?: string;
  };
  behavioral: {
    emailOpens?: number;
    emailClicks?: number;
    websiteVisits?: number;
    downloadedContent?: number;
    formSubmissions?: number;
  };
  engagement: {
    lastActivityDate?: Date;
    totalActivities?: number;
    meetingsScheduled?: number;
    callsAnswered?: number;
  };
  firmographic: {
    revenue?: number;
    employees?: number;
    technology?: string[];
    budget?: number;
  };
}

export interface ScoringRule {
  id: string;
  name: string;
  category: 'demographic' | 'behavioral' | 'engagement' | 'firmographic';
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  score: number;
  weight: number;
  isActive: boolean;
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  private defaultScoringRules: ScoringRule[] = [
    // Demographic Scoring
    {
      id: 'demo_job_title_decision_maker',
      name: 'Decision Maker Job Title',
      category: 'demographic',
      field: 'jobTitle',
      operator: 'contains',
      value: ['CEO', 'CTO', 'VP', 'Director', 'Manager', 'Head'],
      score: 25,
      weight: 1.0,
      isActive: true,
    },
    {
      id: 'demo_company_size_large',
      name: 'Large Company Size',
      category: 'demographic',
      field: 'companySize',
      operator: 'greater_than',
      value: 500,
      score: 20,
      weight: 0.8,
      isActive: true,
    },
    {
      id: 'demo_target_industry',
      name: 'Target Industry',
      category: 'demographic',
      field: 'industry',
      operator: 'contains',
      value: ['Technology', 'Healthcare', 'Finance', 'Manufacturing'],
      score: 15,
      weight: 0.7,
      isActive: true,
    },

    // Behavioral Scoring
    {
      id: 'behav_high_email_engagement',
      name: 'High Email Engagement',
      category: 'behavioral',
      field: 'emailOpens',
      operator: 'greater_than',
      value: 10,
      score: 20,
      weight: 1.0,
      isActive: true,
    },
    {
      id: 'behav_website_visits',
      name: 'Multiple Website Visits',
      category: 'behavioral',
      field: 'websiteVisits',
      operator: 'greater_than',
      value: 5,
      score: 15,
      weight: 0.9,
      isActive: true,
    },
    {
      id: 'behav_content_downloads',
      name: 'Downloaded Content',
      category: 'behavioral',
      field: 'downloadedContent',
      operator: 'greater_than',
      value: 2,
      score: 18,
      weight: 0.8,
      isActive: true,
    },

    // Engagement Scoring
    {
      id: 'engage_recent_activity',
      name: 'Recent Activity',
      category: 'engagement',
      field: 'lastActivityDate',
      operator: 'greater_than',
      value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      score: 25,
      weight: 1.2,
      isActive: true,
    },
    {
      id: 'engage_meeting_scheduled',
      name: 'Meeting Scheduled',
      category: 'engagement',
      field: 'meetingsScheduled',
      operator: 'greater_than',
      value: 0,
      score: 30,
      weight: 1.5,
      isActive: true,
    },

    // Firmographic Scoring
    {
      id: 'firmo_high_revenue',
      name: 'High Revenue Company',
      category: 'firmographic',
      field: 'revenue',
      operator: 'greater_than',
      value: 10000000, // $10M+
      score: 25,
      weight: 1.0,
      isActive: true,
    },
    {
      id: 'firmo_budget_available',
      name: 'Budget Available',
      category: 'firmographic',
      field: 'budget',
      operator: 'greater_than',
      value: 50000, // $50K+
      score: 20,
      weight: 1.1,
      isActive: true,
    },
  ];

  async calculateLeadScore(leadId: string): Promise<number> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { id: leadId },
        relations: ['contact', 'activities'],
      });

      if (!lead) {
        throw new Error(`Lead with ID ${leadId} not found`);
      }

      const criteria = await this.extractLeadCriteria(lead);
      const score = await this.applyScoring(criteria);

      // Update lead score
      lead.score = Math.round(score);
      lead.scoreUpdatedAt = new Date();
      await this.leadRepository.save(lead);

      this.logger.log(`Updated lead score for ${leadId}: ${score}`);
      return score;
    } catch (error) {
      this.logger.error(`Error calculating lead score for ${leadId}:`, error);
      throw error;
    }
  }

  async calculateBulkLeadScores(tenantId?: string): Promise<void> {
    try {
      const queryBuilder = this.leadRepository.createQueryBuilder('lead')
        .leftJoinAndSelect('lead.contact', 'contact')
        .leftJoinAndSelect('lead.activities', 'activities');

      if (tenantId) {
        queryBuilder.where('lead.tenantId = :tenantId', { tenantId });
      }

      const leads = await queryBuilder.getMany();

      for (const lead of leads) {
        try {
          await this.calculateLeadScore(lead.id);
        } catch (error) {
          this.logger.error(`Failed to calculate score for lead ${lead.id}:`, error);
        }
      }

      this.logger.log(`Bulk lead scoring completed for ${leads.length} leads`);
    } catch (error) {
      this.logger.error('Error in bulk lead scoring:', error);
      throw error;
    }
  }

  private async extractLeadCriteria(lead: Lead): Promise<LeadScoringCriteria> {
    const contact = lead.contact;
    const activities = lead.activities || [];

    // Get behavioral data (this would typically come from marketing automation tools)
    const behavioralData = await this.getBehavioralData(contact.email);

    // Calculate engagement metrics
    const lastActivity = activities.length > 0 
      ? new Date(Math.max(...activities.map(a => new Date(a.createdAt).getTime())))
      : null;

    const meetingsScheduled = activities.filter(a => a.type === 'meeting').length;
    const callsAnswered = activities.filter(a => a.type === 'call' && a.outcome === 'answered').length;

    return {
      demographic: {
        companySize: contact.companySize,
        industry: contact.industry,
        jobTitle: contact.jobTitle,
        location: contact.address,
      },
      behavioral: {
        emailOpens: behavioralData.emailOpens || 0,
        emailClicks: behavioralData.emailClicks || 0,
        websiteVisits: behavioralData.websiteVisits || 0,
        downloadedContent: behavioralData.downloadedContent || 0,
        formSubmissions: behavioralData.formSubmissions || 0,
      },
      engagement: {
        lastActivityDate: lastActivity,
        totalActivities: activities.length,
        meetingsScheduled,
        callsAnswered,
      },
      firmographic: {
        revenue: contact.annualRevenue,
        employees: contact.companySize,
        technology: contact.technologies || [],
        budget: lead.budget,
      },
    };
  }

  private async getBehavioralData(email: string): Promise<any> {
    // This would integrate with marketing automation tools like HubSpot, Marketo, etc.
    // For now, return mock data
    return {
      emailOpens: Math.floor(Math.random() * 20),
      emailClicks: Math.floor(Math.random() * 10),
      websiteVisits: Math.floor(Math.random() * 15),
      downloadedContent: Math.floor(Math.random() * 5),
      formSubmissions: Math.floor(Math.random() * 3),
    };
  }

  private async applyScoring(criteria: LeadScoringCriteria): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    for (const rule of this.defaultScoringRules) {
      if (!rule.isActive) continue;

      const categoryData = criteria[rule.category];
      if (!categoryData) continue;

      const fieldValue = categoryData[rule.field];
      if (fieldValue === undefined || fieldValue === null) continue;

      const ruleMatches = this.evaluateRule(rule, fieldValue);
      
      if (ruleMatches) {
        const weightedScore = rule.score * rule.weight;
        totalScore += weightedScore;
        totalWeight += rule.weight;

        this.logger.debug(`Rule ${rule.name} matched: +${weightedScore} points`);
      }
    }

    // Normalize score to 0-100 range
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    return Math.min(100, Math.max(0, normalizedScore));
  }

  private evaluateRule(rule: ScoringRule, value: any): boolean {
    switch (rule.operator) {
      case 'equals':
        return value === rule.value;

      case 'greater_than':
        return typeof value === 'number' && value > rule.value;

      case 'less_than':
        return typeof value === 'number' && value < rule.value;

      case 'contains':
        if (Array.isArray(rule.value)) {
          return rule.value.some(v => 
            typeof value === 'string' && value.toLowerCase().includes(v.toLowerCase())
          );
        }
        return typeof value === 'string' && 
               typeof rule.value === 'string' && 
               value.toLowerCase().includes(rule.value.toLowerCase());

      case 'in_range':
        if (Array.isArray(rule.value) && rule.value.length === 2) {
          return typeof value === 'number' && 
                 value >= rule.value[0] && 
                 value <= rule.value[1];
        }
        return false;

      default:
        return false;
    }
  }

  async getLeadScoreBreakdown(leadId: string): Promise<any> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['contact', 'activities'],
    });

    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    const criteria = await this.extractLeadCriteria(lead);
    const breakdown = {
      totalScore: lead.score || 0,
      categories: {},
      appliedRules: [],
    };

    for (const rule of this.defaultScoringRules) {
      if (!rule.isActive) continue;

      const categoryData = criteria[rule.category];
      if (!categoryData) continue;

      const fieldValue = categoryData[rule.field];
      if (fieldValue === undefined || fieldValue === null) continue;

      const ruleMatches = this.evaluateRule(rule, fieldValue);
      
      if (ruleMatches) {
        const weightedScore = rule.score * rule.weight;
        
        if (!breakdown.categories[rule.category]) {
          breakdown.categories[rule.category] = 0;
        }
        breakdown.categories[rule.category] += weightedScore;

        breakdown.appliedRules.push({
          name: rule.name,
          category: rule.category,
          score: weightedScore,
          reason: `${rule.field} ${rule.operator} ${rule.value}`,
        });
      }
    }

    return breakdown;
  }

  async getLeadsByScore(
    minScore: number = 0,
    maxScore: number = 100,
    tenantId?: string,
  ): Promise<Lead[]> {
    const queryBuilder = this.leadRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .where('lead.score >= :minScore AND lead.score <= :maxScore', { minScore, maxScore })
      .orderBy('lead.score', 'DESC');

    if (tenantId) {
      queryBuilder.andWhere('lead.tenantId = :tenantId', { tenantId });
    }

    return await queryBuilder.getMany();
  }

  async getHotLeads(tenantId?: string): Promise<Lead[]> {
    return this.getLeadsByScore(80, 100, tenantId);
  }

  async getWarmLeads(tenantId?: string): Promise<Lead[]> {
    return this.getLeadsByScore(50, 79, tenantId);
  }

  async getColdLeads(tenantId?: string): Promise<Lead[]> {
    return this.getLeadsByScore(0, 49, tenantId);
  }
}