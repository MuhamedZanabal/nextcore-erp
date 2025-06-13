import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  customFields?: Record<string, any>;
  ownerId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  items: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface ContactFilters {
  search?: string;
  ownerId?: string;
  company?: string;
  page?: number;
  limit?: number;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  customFields?: Record<string, any>;
  ownerId?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export const useContacts = (filters: ContactFilters = {}) => {
  return useQuery<ContactsResponse>({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const { data } = await api.get('/crm/contacts', { params: filters });
      return data;
    },
  });
};

export const useContact = (id: string) => {
  return useQuery<Contact>({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data } = await api.get(`/crm/contacts/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data } = await api.post('/crm/contacts', contactData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContactData }) => {
      const response = await api.patch(`/crm/contacts/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crm/contacts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};