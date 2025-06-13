import React from 'react';
import { useOpportunities, useUpdateOpportunityStage } from '../hooks/useOpportunities';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { DollarSign, Calendar, User } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

const STAGES = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-gray-500' },
  { id: 'qualification', name: 'Qualification', color: 'bg-blue-500' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' },
];

interface PipelineBoardProps {
  onViewOpportunity?: (opportunityId: string) => void;
}

export function PipelineBoard({ onViewOpportunity }: PipelineBoardProps) {
  const { data, isLoading } = useOpportunities(1, 100); // Get all opportunities
  const updateStage = useUpdateOpportunityStage();
  const { toast } = useToast();

  const handleStageChange = async (opportunityId: string, newStage: string) => {
    try {
      await updateStage.mutateAsync({ id: opportunityId, stage: newStage });
      toast({
        title: 'Success',
        description: 'Opportunity stage updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update opportunity stage',
        variant: 'destructive',
      });
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return data?.data?.filter((opp: any) => opp.stage === stage) || [];
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {STAGES.map((stage) => {
        const opportunities = getOpportunitiesByStage(stage.id);
        const stageValue = opportunities.reduce((sum: number, opp: any) => sum + Number(opp.value), 0);

        return (
          <div key={stage.id} className="space-y-3">
            {/* Stage Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-sm">{stage.name}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {opportunities.length}
              </Badge>
            </div>

            {/* Stage Value */}
            <div className="text-sm text-muted-foreground">
              {formatCurrency(stageValue)}
            </div>

            {/* Opportunities */}
            <div className="space-y-2 min-h-[200px]">
              {opportunities.map((opportunity: any) => (
                <Card 
                  key={opportunity.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewOpportunity?.(opportunity.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {opportunity.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {/* Contact */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {opportunity.contact?.firstName} {opportunity.contact?.lastName}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-1 text-xs">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">
                        {formatCurrency(opportunity.value, opportunity.currency)}
                      </span>
                    </div>

                    {/* Expected Close Date */}
                    {opportunity.expectedCloseDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Probability */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {opportunity.probability}% probability
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${stage.color}`}
                          style={{ width: `${opportunity.probability}%` }}
                        />
                      </div>
                    </div>

                    {/* Stage Actions */}
                    <div className="flex gap-1 pt-2">
                      {STAGES.map((targetStage) => {
                        if (targetStage.id === stage.id) return null;
                        
                        return (
                          <Button
                            key={targetStage.id}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageChange(opportunity.id, targetStage.id);
                            }}
                          >
                            → {targetStage.name}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}