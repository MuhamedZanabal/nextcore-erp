import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact, ContactFilters, useContacts, useDeleteContact } from '../hooks/useContacts';

interface ContactsTableProps {
  filters?: ContactFilters;
}

export function ContactsTable({ filters = {} }: ContactsTableProps) {
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<ContactFilters>(filters);
  const { data, isLoading, error } = useContacts(currentFilters);
  const deleteContact = useDeleteContact();
  
  const handlePageChange = (newPage: number) => {
    setCurrentFilters((prev) => ({ ...prev, page: newPage }));
  };
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get('search') as string;
    setCurrentFilters((prev) => ({ ...prev, search, page: 1 }));
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading contacts</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search contacts..."
            defaultValue={currentFilters.search}
            className="px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Search
          </button>
        </form>
        
        <button
          onClick={() => navigate('/crm/contacts/new')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Add Contact
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.items.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.company || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{contact.jobTitle || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                    className="text-primary hover:text-primary/80 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/crm/contacts/${contact.id}/edit`)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.total > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(data.page - 1) * data.limit + 1} to{' '}
            {Math.min(data.page * data.limit, data.total)} of {data.total} contacts
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page * data.limit >= data.total}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}