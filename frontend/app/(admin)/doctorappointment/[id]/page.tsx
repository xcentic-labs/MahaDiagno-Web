"use client"
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Video,
  Stethoscope,
  UserCheck,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define interfaces
interface Specialization {
  id: number;
  label: string;
}

interface Doctor {
  id: number;
  displayName: string;
  specialization: Specialization;
  email: string;
  phoneNumber: string;
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

interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
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
  orderData: OrderData;
}

export default function AppointmentDetails() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointment details
  const fetchAppointmentDetails = async () => {
    if (!appointmentId) {
      setError("Invalid appointment ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get(`/doctorappointment/get/${appointmentId}`);

      if (res.status === 200) {
        setAppointment(res.data);
      } else {
        setError("Failed to load appointment details");
        toast.error("Unable to load appointment details");
      }
    } catch (error) {
      setError("An error occurred while fetching appointment details");
      toast.error("Unable to load appointment details");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  // Format date time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle size={16} className="text-green-600" />,
          text: 'Completed'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertCircle size={16} className="text-yellow-600" />,
          text: 'Pending'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle size={16} className="text-red-600" />,
          text: 'Cancelled'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircle size={16} className="text-blue-600" />,
          text: 'Confirmed'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle size={16} className="text-gray-600" />,
          text: status
        };
    }
  };

  // Get payment status color
  const getPaymentStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={16} className="text-green-600" />
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <AlertCircle size={16} className="text-yellow-600" />
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle size={16} className="text-red-600" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle size={16} className="text-gray-600" />
        };
    }
  };

  // Handle prescription view
  const handleViewPrescription = () => {
    if (appointment?.prescriptionUrl) {
      window.open(`https://api.mahadiagno.com/${appointment.prescriptionUrl}`, '_blank');
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="p-5 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="p-5 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error || "Appointment not found"}</span>
          </div>
          <div className="space-x-3">
            <button
              onClick={fetchAppointmentDetails}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(appointment.status);
  const paymentInfo = getPaymentStatusInfo(appointment.orderData.status);

  return (
    <div className="p-5 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointment Details</h1>
            <p className="text-gray-600">Appointment ID: #{appointment.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {appointment.isRescheduled && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Rescheduled
            </span>
          )}
          <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.text}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Appointment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User size={18} className="mr-2" />
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-medium text-gray-800">
                    {appointment.patientFirstName} {appointment.patientLastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Age & Gender</label>
                  <p className="text-gray-800">{appointment.patientAge} years, {appointment.patientGender}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-800 flex items-center">
                    <Phone size={16} className="mr-2" />
                    +91 {appointment.patientPhoneNumber}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booked By</label>
                  <p className="text-gray-800">
                    {appointment.bookedBy.first_name} {appointment.bookedBy.last_name}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Booker's Email</label>
                  <p className="text-gray-800 flex items-center">
                    <Mail size={16} className="mr-2" />
                    {appointment.bookedBy.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Booker's Phone</label>
                  <p className="text-gray-800 flex items-center">
                    <Phone size={16} className="mr-2" />
                    +91 {appointment.bookedBy.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope size={18} className="mr-2" />
              Doctor Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Doctor Name</label>
                  <p className="text-lg font-medium text-gray-800">{appointment.doctor.displayName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialization</label>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {appointment.doctor.specialization.label}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800 flex items-center">
                    <Mail size={16} className="mr-2" />
                    {appointment.doctor.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-800 flex items-center">
                    <Phone size={16} className="mr-2" />
                    +91 {appointment.doctor.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar size={18} className="mr-2" />
              Appointment Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar size={32} className="mx-auto text-blue-600 mb-2" />
                <label className="text-sm font-medium text-gray-500 block">Date</label>
                <p className="font-semibold text-gray-800">{formatDate(appointment.date)}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock size={32} className="mx-auto text-green-600 mb-2" />
                <label className="text-sm font-medium text-gray-500 block">Time Slot</label>
                <p className="font-semibold text-gray-800">
                  {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <UserCheck size={32} className="mx-auto text-purple-600 mb-2" />
                <label className="text-sm font-medium text-gray-500 block">Slot ID</label>
                <p className="font-semibold text-gray-800">#{appointment.slot.id}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(appointment.prescriptionUrl || appointment.videoCallId) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText size={18} className="mr-2" />
                Additional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.prescriptionUrl && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText size={20} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Prescription</p>
                        <p className="text-sm text-gray-500">View prescription document</p>
                      </div>
                    </div>
                    <button
                      onClick={handleViewPrescription}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                  </div>
                )}
                
                {appointment.videoCallId && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Video size={20} className="text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Video Call ID</p>
                        <p className="text-sm text-gray-500 font-mono">{appointment.videoCallId}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Payment & System Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard size={18} className="mr-2" />
              Payment Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-xl text-gray-800 flex items-center">
                  {/* <DollarSign size={16} className="mr-1" /> */}
                  ₹{appointment.orderData.amount}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium text-gray-800">{appointment.orderData.currency}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <div className={`px-2 py-1 rounded-full flex items-center space-x-1 ${paymentInfo.color}`}>
                  {paymentInfo.icon}
                  <span className="font-medium">{appointment.orderData.status}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order ID</span>
                  <span className="text-sm font-mono text-gray-700">{appointment.orderData.orderId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment ID</span>
                  <span className="text-sm font-mono text-gray-700">{appointment.rpzPaymentId}</span>
                </div>
                
                {appointment.rpzRefundPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Refund ID</span>
                    <span className="text-sm font-mono text-gray-700">{appointment.rpzRefundPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span className="text-gray-700">#{appointment.userId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor ID</span>
                <span className="text-gray-700">#{appointment.doctorId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Timings ID</span>
                <span className="text-gray-700">#{appointment.slot.timingsId}</span>
              </div>
              
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-700">{formatDateTime(appointment.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-gray-700">{formatDateTime(appointment.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}