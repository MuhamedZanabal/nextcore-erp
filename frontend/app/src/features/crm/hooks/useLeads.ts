import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

export interface Lead {
  id: string;
  contactId: string;
  status: string;
  score: number;
  source: string;
  campaignId?: string;
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

export interface CreateLeadData {
  contactId: string;
  status?: string;
  score?: number;
  source: string;
  campaignId?: string;
  ownerId?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {}

export function useLeads(page = 1, limit = 10, search?: string) {
  return useQuery({
    queryKey: ['leads', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const response = await apiClient.get(`/crm/leads?${params}`);
      return response.data;
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await apiClient.get(`/crm/leads/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      const response = await apiClient.post('/crm/leads', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadData }) => {
      const response = await apiClient.put(`/crm/leads/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/crm/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/crm/leads/${id}/convert`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}