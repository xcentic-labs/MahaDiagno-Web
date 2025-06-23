"use client"
import { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Search, Loader2, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { axiosClient } from '@/lib/axiosClient';
import { useRouter } from 'next/navigation';

// Updated TypeScript interfaces for the new data structure
interface ServiceBoy {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  partnerId: number;
}

interface BookedByUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface ServiceId {
  id: number;
  title: string;
  price: string;
  bannerUrl: string;
  isHomeServiceAvail: boolean;
  zoneId: number;
  partnerId: number;
  partner : {
    hospitalName : string
  }
}

interface Appointment {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  patientAge: string;
  gender: 'Male' | 'Female' | 'Other';
  referringDoctor: string;
  additionalPhoneNumber: string;
  status: 'ACCEPTED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
  userId: number;
  partnerId: number;
  serviceId: ServiceId;
  acceptedBy: number;
  addressId: number | null;
  isReportUploaded: boolean;
  reportName: string | null;
  isPaid: boolean;
  modeOfPayment: string;
  isRecivesByPartner: boolean;
  createdAt: string;
  updatedAt: string;
  serviceBoy: ServiceBoy;
  address: any | null;
  bookedByUser: BookedByUser;
  appointementId: string;
}

interface ApiResponse {
  message: string;
  myAppointments: Appointment[];
}

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const redirect = useRouter()

  // Function to get the patient's full name
  const getPatientFullName = (appointment: Appointment): string => {
    return `${appointment.patientFirstName} ${appointment.patientLastName}`.trim();
  };

  // Function to get the booked by user's full name
  const getBookedByFullName = (bookedBy: BookedByUser): string => {
    return `${bookedBy.firstName} ${bookedBy.lastName}`.trim();
  };

  // Function to get the service boy's full name
  const getServiceBoyFullName = (serviceBoy: ServiceBoy): string => {
    return `${serviceBoy.firstName} ${serviceBoy.lastName}`.trim();
  };

  // Function to get the status badge color
  const getStatusBadgeColor = (status: Appointment['status']): string => {
    switch (status) {
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view details
  const handleViewDetails = (id: number): void => {
    redirect.push(`/appointment/${id}`)
  };

  // Handle report download
  const handleDownloadReport = (appointment: Appointment): void => {
    if (appointment.reportName) {
      // Implement your report download logic here
      toast.info(`Downloading report: ${appointment.reportName}`);
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      appointment.appointementId.toLowerCase().includes(searchTerm) ||
      getPatientFullName(appointment).toLowerCase().includes(searchTerm) ||
      getBookedByFullName(appointment.bookedByUser).toLowerCase().includes(searchTerm) ||
      appointment.serviceId.title.toLowerCase().includes(searchTerm)
    );
  });

  const handleFetchAppointments = async () => {
    setLoadingState('loading');
    setIsLoading(true);
    setError(null);

    try {
      // Updated API endpoint - adjust according to your actual endpoint
      const res = await axiosClient.get('/appointment/getallappointement?status=ACCEPTED');

      if (res.status === 200) {
        const apiResponse: ApiResponse = res.data;
        setAppointments(apiResponse.myAppointments || []);
        setLoadingState('success');
      } else {
        setError("Failed to load appointments. Server returned an error.");
        toast.error("Unable to load appointments");
        setLoadingState('error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching appointments";
      setError(errorMessage);
      toast.error("Unable to load appointments");
      setLoadingState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    handleFetchAppointments();
  };

  useEffect(() => {
    handleFetchAppointments();
  }, []);

  // Render different content based on loading state
  const renderContent = () => {
    if (isLoading && loadingState === 'initial') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading appointments data...</p>
        </div>
      );
    }

    if (loadingState === 'error') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load appointments</h3>
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
            <span>Refreshing appointment data...</span>
          </div>
        )}

        <table className="w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500 table-fixed">
          <thead className="bg-gray-300 border-b rounded-t-xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider w-12">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Appointment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Service Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Hospital Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment: Appointment, index: number) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {appointment.appointementId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBookedByFullName(appointment.bookedByUser)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {`+91 ${appointment.bookedByUser.phoneNumber || "--"}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">
                    {appointment.bookedByUser.email || "--"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 truncate">
                    {appointment.serviceId.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="max-w-full truncate" title="Address not available">
                      {appointment.serviceId.partner.hospitalName}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(appointment.id)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors cursor-pointer"
                        title="Edit Appointment"
                        disabled={deletingIds.has(appointment.id)}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-sm text-gray-500">
                  {searchQuery ? (
                    <div className="py-8">
                      <Search size={24} className="mx-auto text-gray-400 mb-2" />
                      <p>No matching appointments found for "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <p>No appointments available</p>
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
          <h2 className="text-lg font-semibold text-gray-700">Appointment Management</h2>
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
              placeholder="Search by Appointment ID, Name, or Service"
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