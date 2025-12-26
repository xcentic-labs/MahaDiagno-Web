"use client";

import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, RefreshCw } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define TypeScript interface for PharmacyVendor
interface PharmacyVendor {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  imageUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
}

export default function PharmacyVendorsPage() {
  // States
  const [vendors, setVendors] = useState<PharmacyVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<number | null>(null);
  
  const router = useRouter();

  // Handle delete vendor
  const handleDeleteVendor = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this pharmacy vendor?")) {
      return;
    }

    try {
      setDeletingVendorId(id);
      const res = await axiosClient.delete(`/pharmacy/pharmacyvendor/deactivatepharmacyvendor/${id}`);

      if (res.status === 200) {
        toast.success("Pharmacy vendor deactivated successfully");
        // Update the vendors state by removing the deleted vendor
        setVendors(vendors.filter(vendor => vendor.id !== id));
      } else {
        toast.error("Failed to deactivate vendor");
      }
    } catch (error) {
      console.error("Error deactivating vendor:", error);
      toast.error("An error occurred while trying to deactivate the vendor");
    } finally {
      setDeletingVendorId(null);
    }
  };

  // Handle view vendor details
  const handleViewVendor = (id: number): void => {
    router.push(`/pharmacyvendors/${id}`);
  };

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/pharmacy/pharmacyvendor/getallpharmacyvendors');

      if (res.status === 200) {
        console.log(res.data);
        setVendors(res.data.data);
      } else {
        setError("Failed to load pharmacy vendors data");
        toast.error("Unable to load pharmacy vendors data");
      }
    } catch (error) {
      setError("An error occurred while fetching pharmacy vendors");
      toast.error("Unable to load pharmacy vendors data");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchVendors();
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Pharmacy Vendors List</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vendors..."
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
            <p className="text-gray-600 mt-2">Loading pharmacy vendors data...</p>
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

        {/* Vendors Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Shop Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {vendor.imageUrl && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${vendor.imageUrl}`}
                              alt={vendor.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +91 {vendor.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.shopName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap justify-center text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewVendor(vendor.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Vendor"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingVendorId === vendor.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Deactivate Vendor"
                            disabled={deletingVendorId === vendor.id}
                          >
                            {deletingVendorId === vendor.id ? (
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
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No pharmacy vendors found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && vendors.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No pharmacy vendors available</p>
          </div>
        )}
      </div>
    </div>
  );
}