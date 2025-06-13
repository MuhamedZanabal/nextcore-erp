import React, { useState } from 'react';
import { useLeads, useDeleteLead, useConvertLead } from '../hooks/useLeads';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { MoreHorizontal, Search, UserPlus, TrendingUp } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

interface LeadsTableProps {
  onEditLead?: (leadId: string) => void;
  onViewLead?: (leadId: string) => void;
}

export function LeadsTable({ onEditLead, onViewLead }: LeadsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  
  const { data, isLoading, error } = useLeads(page, 10, search);
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Lead deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete lead',
          variant: 'destructive',
        });
      }
    }
  };

  const handleConvert = async (id: string) => {
    if (window.confirm('Convert this lead to an opportunity?')) {
      try {
        await convertLead.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Lead converted to opportunity successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to convert lead',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'outline',
      unqualified: 'destructive',
      converted: 'default',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Hot</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Warm</Badge>;
    return <Badge className="bg-blue-500">Cold</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading leads. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((lead: any) => (
              <TableRow 
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewLead?.(lead.id)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {lead.contact?.firstName} {lead.contact?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lead.contact?.email}
                    </div>
                    {lead.contact?.company && (
                      <div className="text-sm text-muted-foreground">
                        {lead.contact?.company}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getScoreBadge(lead.score)}
                    <span className="text-sm">{lead.score}</span>
                  </div>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewLead?.(lead.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditLead?.(lead.id)}>
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleConvert(lead.id)}
                        className="text-green-600"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Convert to Opportunity
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600"
                      >
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.total > 10 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page * 10 >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}