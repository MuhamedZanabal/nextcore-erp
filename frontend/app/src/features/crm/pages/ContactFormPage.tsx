import { useParams, useNavigate } from 'react-router-dom';
import { ContactForm } from '../components/ContactForm';
import { useContact } from '../hooks/useContacts';

export default function ContactFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading, error } = useContact(id);
  
  const handleSuccess = () => {
    navigate(id ? `/crm/contacts/${id}` : '/crm/contacts');
  };
  
  if (id && isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-4">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (id && (error || !contact)) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-4 text-red-500">Error loading contact</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {id ? 'Edit Contact' : 'New Contact'}
          </h1>
          <button
            onClick={() => navigate(id ? `/crm/contacts/${id}` : '/crm/contacts')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ContactForm initialData={contact} onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}