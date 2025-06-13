import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Contact, CreateContactData, useCreateContact, useUpdateContact } from '../hooks/useContacts';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  ownerId: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialData?: Contact;
  onSuccess?: () => void;
}

export function ContactForm({ initialData, onSuccess }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phone: initialData.phone || '',
      company: initialData.company || '',
      jobTitle: initialData.jobTitle || '',
      ownerId: initialData.ownerId || '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      ownerId: '',
    },
  });
  
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateContact.mutateAsync({ id: initialData.id, data });
      } else {
        await createContact.mutateAsync(data as CreateContactData);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name *
          </label>
          <input
            id="firstName"
            {...register('firstName')}
            className="w-full p-2 border rounded-md"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name *
          </label>
          <input
            id="lastName"
            {...register('lastName')}
            className="w-full p-2 border rounded-md"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full p-2 border rounded-md"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <input
          id="phone"
          {...register('phone')}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-medium">
          Company
        </label>
        <input
          id="company"
          {...register('company')}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job Title
        </label>
        <input
          id="jobTitle"
          {...register('jobTitle')}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : initialData ? 'Update Contact' : 'Create Contact'}
      </button>
    </form>
  );
}