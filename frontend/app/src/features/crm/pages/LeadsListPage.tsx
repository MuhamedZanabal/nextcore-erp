import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadsTable } from '../components/LeadsTable';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

export function LeadsListPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <Button onClick={() => navigate('/crm/leads/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Leads Table */}
      <LeadsTable
        onViewLead={(id) => navigate(`/crm/leads/${id}`)}
        onEditLead={(id) => navigate(`/crm/leads/${id}/edit`)}
      />
    </div>
  );
}