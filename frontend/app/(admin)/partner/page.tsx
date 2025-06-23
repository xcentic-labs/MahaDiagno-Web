"use client"
import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, RefreshCw } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define TypeScript interface for Partner
interface Partner {
  id: number;
  hospitalName: string | null;
  phoneNumber: string | null;
  email: string | null;
  isSubscribed: boolean;
  _count: {
    subscription_purchase: number;
    serviceBoy: number;
    appointment: number;
    services: number;
  };
}

export default function Partner() {
  // States
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState<number | null>(null);
  const redirect = useRouter();

  // Handle delete partner
  const handleDeletePartner = async (id: number) => {
    try {
      setDeletingPartnerId(id);
      const res = await axiosClient.delete(`/partners/deletepartners/${id}`);

      if (res.status === 200) {
        toast.success("Partner deleted successfully");
        // Update the partners state by removing the deleted partner
        setPartners(partners.filter(partner => partner.id !== id));
      } else {
        toast.error("Failed to delete partner");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("An error occurred while trying to delete the partner");
    } finally {
      setDeletingPartnerId(null);
    }
  };

  // Handle view partner details
  const handleViewPartner = (id: number): void => {
    redirect.push(`/partner/${id}`);
  };

  // Filter partners based on search query
  const filteredPartners = partners.filter(partner =>
    (partner.hospitalName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (partner.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (partner.phoneNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/partners/getallpartners');

      if (res.status === 200) {
        console.log(res.data.partners);
        setPartners(res.data.partners);
      } else {
        setError("Failed to load partners data");
        toast.error("Unable to load partners data");
      }
    } catch (error) {
      setError("An error occurred while fetching partners");
      toast.error("Unable to load partners data");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchPartners();
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Partner List</h2>
          <button
            onClick={handleRetry}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || error !== null}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
            <p className="text-gray-600 mt-2">Loading partners data...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Partners Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Hospital Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Subscription Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Total Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Service Boys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.hospitalName || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.phoneNumber ? `+91 ${partner.phoneNumber}` : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.email || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.isSubscribed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {partner.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.appointment || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.serviceBoy || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.services || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewPartner(partner.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Partner"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingPartnerId === partner.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete Partner"
                            disabled={deletingPartnerId === partner.id}
                          >
                            {deletingPartnerId === partner.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No partners found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && partners.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No partners available</p>
          </div>
        )}
      </div>
    </div>
  );
}