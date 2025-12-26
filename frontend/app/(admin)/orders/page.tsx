"use client"
import { useEffect, useState } from 'react';
import { Eye, Edit, Search, Loader2, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { axiosClient } from '@/lib/axiosClient';
import { useRouter } from 'next/navigation';

// TypeScript interfaces for the order data structure
interface User {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phoneNumber: string;
}

interface PharmacyVendor {
  name: string;
  shopName: string;
}

interface Address {
  id: number;
  area: string;
  landmark: string;
  pincode: string;
  district: string;
  state: string;
  lat: string;
  lng: string;
  userId: number | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  orderId: number;
  medicineId: number;
}

interface Order {
  id: number;
  userId: number;
  pharmacyVendorId: number;
  totalAmount: number;
  orderstatus: 'PLACED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  modeOfPayment: string;
  user: User;
  pharmacyVendor: PharmacyVendor;
  address: Address;
  orderItem: OrderItem[];
}

interface ApiResponse {
  data: Order[];
}

export default function MedicineOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const router = useRouter();

  // Function to get the user's full name
  const getUserFullName = (user: User): string => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  };

  // Function to get the status badge color
  const getStatusBadgeColor = (status: Order['orderstatus']): string => {
    switch (status) {
      case "PLACED":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  // Function to get full address
  const getFullAddress = (address: Address): string => {
    return `${address.area}, ${address.landmark}, ${address.district}, ${address.state} - ${address.pincode}`;
  };

  // Handle view details
  const handleViewDetails = (id: number): void => {
    router.push(`/orders/${id}`)
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(searchTerm) ||
      getUserFullName(order.user).toLowerCase().includes(searchTerm) ||
      order.user.phoneNumber.includes(searchTerm) ||
      order.pharmacyVendor.shopName.toLowerCase().includes(searchTerm) ||
      order.pharmacyVendor.name.toLowerCase().includes(searchTerm)
    );
  });

  const handleFetchOrders = async () => {
    setLoadingState('loading');
    setIsLoading(true);
    setError(null);

    try {
      const res = await axiosClient.get('/pharmacy/order/orders');

      if (res.status === 200) {
        const apiResponse: ApiResponse = res.data;
        setOrders(apiResponse.data || []);
        setLoadingState('success');
        // toast.success('Orders loaded successfully');
      } else {
        setError("Failed to load orders. Server returned an error.");
        toast.error("Unable to load orders");
        setLoadingState('error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching orders";
      setError(errorMessage);
      toast.error("Unable to load orders");
      setLoadingState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    handleFetchOrders();
  };

  useEffect(() => {
    handleFetchOrders();
  }, []);

  // Render different content based on loading state
  const renderContent = () => {
    if (isLoading && loadingState === 'initial') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading orders data...</p>
        </div>
      );
    }

    if (loadingState === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load orders</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry Loading
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <Loader2 size={18} className="animate-spin mr-2" />
            <span>Refreshing orders data...</span>
          </div>
        )}

        <table className="w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500 table-fixed">
          <thead className="bg-gray-300 border-b rounded-t-xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider w-12">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Shop Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order, index: number) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    #{order.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getUserFullName(order.user)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user.phoneNumber || '--'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 truncate">
                    {order.pharmacyVendor.shopName}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 truncate">
                    {order.pharmacyVendor.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Package size={14} className="mr-1 text-gray-500" />
                      {order.orderItem.length} item(s)
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {order.modeOfPayment}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.orderstatus)}`}>
                      {order.orderstatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                  {searchQuery ? (
                    <div className="py-8">
                      <Search size={24} className="mx-auto text-gray-400 mb-2" />
                      <p>No matching orders found for "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Package size={40} className="mx-auto text-gray-400 mb-2" />
                      <p>No orders available</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-5 h-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Medicine Orders Management</h2>
          <button
            onClick={handleRetry}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, Phone, or Shop Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading && loadingState === 'initial'}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {renderContent()}
      </div>
    </div>
  );
}
