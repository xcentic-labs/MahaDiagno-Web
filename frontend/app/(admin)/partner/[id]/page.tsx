"use client"
import { useParams, useRouter } from "next/navigation";
import { axiosClient } from "@/lib/axiosClient";
import { useEffect, useState } from "react";
import { Eye, Phone, Mail, MapPin, Calendar, User, Stethoscope, CreditCard, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

// Define interfaces
interface SubscriptionPurchase {
  id: number;
  partnersId: number;
  numberOfServiceBoyLeft: number;
  purchasedAt: string;
  expiresAt: string;
  renewedAt: string | null;
  subscriptionId: number;
}

interface ServiceBoy {
  id: number;
  first_name: string;
  last_name: string;
  phoneNumber: string;
  email: string;
  password: string;
  status: boolean;
  isActive: boolean;
  partnerId: number;
}

interface Appointment {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_age: string;
  gender: string;
  referring_doctor: string;
  additional_phone_number: string;
  status: string;
  userId: number;
  partnerId: number;
  service_id: number;
  acceptedBy: number | null;
  addressId: number | null;
  isReportUploaded: boolean;
  reportName: string | null;
  isPaid: boolean;
  modeOfPayment: string;
  isRecivesByPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: number;
  title: string;
  price: string;
  banner_url: string;
  isHomeServiceAvail: boolean;
  zoneId: number;
  partnerId: number;
}

interface Partner {
  id: number;
  hospitalName: string;
  email: string;
  phoneNumber: string;
  password: string;
  zoneId: number;
  addressId: number;
  isSubscribed: boolean;
  subscription_purchase: SubscriptionPurchase[];
  serviceBoy: ServiceBoy[];
  appointment: Appointment[];
  services: Service[];
}

interface ApiResponse {
  message: string;
  partner: Partner;
}

export default function SpecificPartner() {
  const { id } = useParams();
  const router = useRouter();
  const redirect = useRouter();

  const [partnerData, setPartnerData] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status colors for appointments
  const statusColors: Record<string, string> = {
    'SCHEDULED': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    'ACCEPTED': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
    'COMPLETED': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    'CANCELLED': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    'PENDING': 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
  };

  const fetchPartner = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axiosClient.get(`/partners/getpartners/${id}`);
      
      if (res.status === 200) {
        console.log(res.data.partner);
        setPartnerData(res.data.partner);
      } else {
        setError("Failed to load partner data");
        toast.error("Unable to load partner data");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred while fetching partner data");
      toast.error("Unable to load partner data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    fetchPartner();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (id) {
      fetchPartner();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partnerData) {
    return (
      <div className="p-5">
        <div className="text-center py-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error || "Partner not found"}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Partner Details</h1>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <RefreshCw size={16} className="mr-1" />
          Refresh
        </button>
      </div>

      {/* Partner Basic Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Stethoscope size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{partnerData.hospitalName}</h2>
            <div className="flex items-center mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                partnerData.isSubscribed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {partnerData.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Mail size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">{partnerData.email}</span>
          </div>
          <div className="flex items-center">
            <Phone size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">+91 {partnerData.phoneNumber}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">Zone ID: {partnerData.zoneId}</span>
          </div>
          <div className="flex items-center">
            <FileText size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">Partner ID: {partnerData.id}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar size={20} className="text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-xl font-semibold">{partnerData.appointment.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <User size={20} className="text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Service Boys</p>
              <p className="text-xl font-semibold">{partnerData.serviceBoy.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Stethoscope size={20} className="text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Services</p>
              <p className="text-xl font-semibold">{partnerData.services.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <CreditCard size={20} className="text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Subscriptions</p>
              <p className="text-xl font-semibold">{partnerData.subscription_purchase.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      {partnerData.subscription_purchase.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Details</h3>
          <div className="space-y-3">
            {partnerData.subscription_purchase.map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Boys Left</p>
                    <p className="font-medium">{subscription.numberOfServiceBoyLeft}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purchased At</p>
                    <p className="font-medium">{formatDate(subscription.purchasedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires At</p>
                    <p className="font-medium">{formatDate(subscription.expiresAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Boys */}
      {partnerData.serviceBoy.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Boys</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partnerData.serviceBoy.map((serviceBoy) => (
                  <tr key={serviceBoy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {serviceBoy.first_name} {serviceBoy.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {serviceBoy.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      +91 {serviceBoy.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        serviceBoy.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {serviceBoy.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        serviceBoy.isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {serviceBoy.isActive ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services */}
      {partnerData.services.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerData.services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">{service.title}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Home Service:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      service.isHomeServiceAvail 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isHomeServiceAvail ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments */}
      <div className="border rounded-md shadow-sm">
        <div className="flex justify-between items-center bg-gray-100 px-6 py-3 border-b">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-700">Appointments</h2>
          </div>
          <div>
            <span className="px-2 py-1 text-sm bg-gray-200 rounded-md text-gray-700">
              Total: {partnerData.appointment.length}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referring Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode of Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partnerData.appointment.length > 0 ? (
                partnerData.appointment.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {appointment.patient_first_name} {appointment.patient_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.patient_age} / {appointment.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.referring_doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      +91 {appointment.additional_phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-700 mt-1">
                          {appointment.modeOfPayment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={statusColors[appointment.status] || statusColors['PENDING']}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-500 hover:text-blue-700 cursor-pointer" 
                        onClick={() => redirect.push(`/appointment/${appointment.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No appointments found for this partner.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}