"use client"
import { useEffect, useState } from 'react';
import { Eye, Search, RefreshCw, Calendar, Filter, Download, User, Stethoscope } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define interfaces
interface Doctor {
  id: number;
  fName: string;
  lName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  imageUrl: string | null;
  isVerified: boolean;
  clinicName: string;
}

interface BookedBy {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phoneNumber: string;
}

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  timingsId: number;
}

interface Appointment {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  patientAge: number;
  patientGender: string;
  patientPhoneNumber: string;
  userId: number;
  doctorId: number;
  status: string;
  rpzOrderId: string;
  rpzRefundPaymentId: string | null;
  rpzPaymentId: string;
  date: string;
  slotId: number;
  isRescheduled: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptionUrl: string | null;
  videoCallId: string | null;
  doctor: Doctor;
  bookedBy: BookedBy;
  slot: Slot;
}

export default function AppointmentsList() {
  // States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/doctorappointment/getall');

      if (res.status === 200) {
        console.log(res.data);
        setAppointments(res.data);
        setFilteredAppointments(res.data);
      } else {
        setError("Failed to load appointments data");
        toast.error("Unable to load appointments data");
      }
    } catch (error) {
      setError("An error occurred while fetching appointments");
      toast.error("Unable to load appointments data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view appointment details
  const handleViewAppointment = (id: number): void => {
    router.push(`/doctorappointment/${id}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status color and styling
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter appointments based on search and filters
  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(appointment =>
        appointment.patientFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patientLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.patientPhoneNumber.includes(searchQuery) ||
        appointment.id.toString().includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(appointment =>
        appointment.date === dateFilter
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(appointments.map(app => app.status))];

  // Retry fetching data
  const handleRetry = () => {
    fetchAppointments();
  };

  // Export appointments (basic implementation)
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Patient Name', 'Doctor', 'Date', 'Time', 'Status', 'Phone', 'Booked By'].join(','),
      ...filteredAppointments.map(app => [
        app.id,
        `${app.patientFirstName} ${app.patientLastName}`,
        app.doctor.displayName,
        app.date,
        `${formatTime(app.slot.startTime)} - ${formatTime(app.slot.endTime)}`,
        app.status,
        app.patientPhoneNumber,
        `${app.bookedBy.first_name} ${app.bookedBy.last_name}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Doctor Appointments</h2>
            <p className="text-sm text-gray-500">
              Total: {filteredAppointments.length} appointments
              {filteredAppointments.length !== appointments.length && 
                ` (filtered from ${appointments.length})`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={isLoading || filteredAppointments.length === 0}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
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

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || error !== null}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
              disabled={isLoading || error !== null}
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
            <Filter size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || error !== null}
            />
            <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateFilter('');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            disabled={isLoading || error !== null}
          >
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
            <p className="text-gray-600 mt-2">Loading appointments data...</p>
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

        {/* Appointments Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Booked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{appointment.id}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {appointment.patientFirstName} {appointment.patientLastName}
                            </div>
                            <div className="text-gray-500">
                              {appointment.patientAge}yr, {appointment.patientGender}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {appointment.doctor.imageUrl ? (
                            <img
                              src={`https://api.mahadiagno.com/${appointment.doctor.imageUrl}`}
                              alt={appointment.doctor.displayName}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          ) : (
                            <Stethoscope size={16} className="mr-2 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{appointment.doctor.displayName}</div>
                            <div className="text-gray-500 text-xs">
                              {appointment.doctor.clinicName}
                              {appointment.doctor.isVerified && (
                                <span className="ml-1 text-green-600">✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatDate(appointment.date)}</div>
                          <div className="text-gray-500">
                            {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          {appointment.isRescheduled && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Rescheduled
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>+91 {appointment.patientPhoneNumber}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {appointment.bookedBy.first_name} {appointment.bookedBy.last_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            +91 {appointment.bookedBy.phoneNumber}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewAppointment(appointment.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Appointment Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery || statusFilter !== 'all' || dateFilter
                        ? "No appointments found matching your filters"
                        : "No appointments found"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && appointments.length === 0 && (
          <div className="text-center py-10">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No appointments available</p>
            <p className="text-gray-500">Appointments will appear here once they are booked.</p>
          </div>
        )}

        {/* Pagination info */}
        {!isLoading && !error && filteredAppointments.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
            {appointments.length > 50 && (
              <div className="text-xs text-gray-400">
                Consider implementing pagination for better performance
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}