import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

export interface Opportunity {
  id: string;
  contactId: string;
  name: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

export interface CreateOpportunityData {
  contactId: string;
  name: string;
  value: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  ownerId?: string;
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {}

export function useOpportunities(page = 1, limit = 10, search?: string) {
  return useQuery({
    queryKey: ['opportunities', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const response = await apiClient.get(`/crm/opportunities?${params}`);
      return response.data;
    },
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const response = await apiClient.get(`/crm/opportunities/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateOpportunityData) => {
      const response = await apiClient.post('/crm/opportunities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOpportunityData }) => {
      const response = await apiClient.put(`/crm/opportunities/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/crm/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunityStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const response = await apiClient.patch(`/crm/opportunities/${id}/stage`, { stage });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', variables.id] });
    },
  });
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ['pipeline-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/crm/opportunities/metrics');
      return response.data;
    },
  });
}