"use client"
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Building2, 
    Calendar, 
    CheckCircle, 
    Clock, 
    XCircle, 
    CreditCard, 
    Banknote, 
    RefreshCw, 
    Loader, 
    AlertTriangle,
    Badge,
    Activity,
    DollarSign,
    FileText
} from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter, useParams } from 'next/navigation';

interface ServiceBoyDetail {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: boolean;
    partner: {
        id: number;
        hospitalName: string;
        email: string;
        phoneNumber: string;
        address: {
            district: string;
            pincode: string;
            state: string;
        };
    };
    appointments: Appointment[];
}

interface Appointment {
    id: number;
    isPaid: boolean;
    modeOfPayment: string;
    status: string;
    isRecivesByPartner: boolean;
    service: {
        title: string;
        price: string;
    };
    appointmentId: string;
}

interface ApiResponse {
    message: string;
    serviceboy: ServiceBoyDetail;
}

export default function ServiceBoyDetailManagement() {
    const router = useRouter();
    const params = useParams();
    const serviceBoyId = params?.id;
    
    // Data states
    const [serviceBoy, setServiceBoy] = useState<ServiceBoyDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceBoyDetail = async () => {
        if (!serviceBoyId) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const res = await axiosClient.get(`/serviceboy/getspecficserviceboy/${serviceBoyId}`);

            if (res.status === 200) {
                const data: ApiResponse = res.data;
                setServiceBoy(data.serviceboy);
                toast.success(data.message);
            } else {
                throw new Error("Failed to fetch service boy details");
            }
        } catch (error: any) {
            console.error("Fetch service boy error:", error);
            const errorMessage = error.response?.data?.error || "Unable to fetch service boy details. Please try again.";
            setError(errorMessage);
            toast.error("Failed to load service boy details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceBoyDetail();
    }, [serviceBoyId]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ACCEPTED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentIcon = (mode: string) => {
        return mode.toLowerCase() === 'cash' ? <Banknote size={14} /> : <CreditCard size={14} />;
    };

    if (isLoading) {
        return (
            <div className="p-5 h-screen">
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader size={40} className="text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 text-lg">Loading service boy details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex items-center text-red-700">
                        <AlertTriangle size={24} className="mr-3" />
                        <div>
                            <h3 className="font-semibold">Error Loading Service Boy</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchServiceBoyDetail}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                    >
                        <RefreshCw size={16} className="mr-2" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!serviceBoy) {
        return (
            <div className="p-5 h-screen">
                <div className="text-center py-20">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">Service boy not found</p>
                </div>
            </div>
        );
    }

    const totalAppointments = serviceBoy.appointments.length;
    const completedAppointments = serviceBoy.appointments.filter(apt => apt.status === 'COMPLETED').length;
    const totalRevenue = serviceBoy.appointments
        .filter(apt => apt.isPaid)
        .reduce((sum, apt) => sum + parseInt(apt.service.price), 0);

    return (
        <div className="p-5 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Service Boys
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {serviceBoy.firstName} {serviceBoy.lastName}
                        </h1>
                        <p className="text-gray-600">Service Boy Details & Appointments</p>
                    </div>
                    
                    <button
                        onClick={fetchServiceBoyDetail}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Appointments</p>
                            <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{completedAppointments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <DollarSign size={24} className="text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${serviceBoy.status ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Activity size={24} className={serviceBoy.status ? 'text-green-600' : 'text-red-600'} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`text-lg font-bold ${serviceBoy.status ? 'text-green-600' : 'text-red-600'}`}>
                                {serviceBoy.status ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Service Boy Information */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <User size={20} className="mr-2" />
                            Personal Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <User size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="font-medium">{serviceBoy.firstName} {serviceBoy.lastName}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Mail size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{serviceBoy.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Phone size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{serviceBoy.phoneNumber}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Badge size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Service Boy ID</p>
                                    <p className="font-medium">#{serviceBoy.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Partner Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Building2 size={20} className="mr-2" />
                            Partner Hospital
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Building2 size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Hospital Name</p>
                                    <p className="font-medium">{serviceBoy.partner.hospitalName}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Mail size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{serviceBoy.partner.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <Phone size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{serviceBoy.partner.phoneNumber}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <MapPin size={16} className="text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Address</p>
                                    <p className="font-medium">
                                        {serviceBoy.partner.address.district}, {serviceBoy.partner.address.state}
                                    </p>
                                    <p className="text-sm text-gray-500">PIN: {serviceBoy.partner.address.pincode}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <FileText size={20} className="mr-2" />
                            Appointments History
                        </h2>
                        
                        {serviceBoy.appointments.length > 0 ? (
                            <div className="space-y-4">
                                {serviceBoy.appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-900">
                                                    {appointment.appointmentId}
                                                </span>
                                                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                {getPaymentIcon(appointment.modeOfPayment)}
                                                <span className="ml-1 capitalize">{appointment.modeOfPayment}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Service</p>
                                                <p className="font-medium">{appointment.service.title}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-600">Price</p>
                                                <p className="font-medium">₹{appointment.service.price}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-600">Payment Status</p>
                                                <div className="flex items-center">
                                                    {appointment.isPaid ? (
                                                        <CheckCircle size={16} className="text-green-500 mr-1" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-500 mr-1" />
                                                    )}
                                                    <span className={`text-sm font-medium ${appointment.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                        {appointment.isPaid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {appointment.isRecivesByPartner && (
                                            <div className="mt-3 flex items-center text-sm text-blue-600">
                                                <CheckCircle size={14} className="mr-1" />
                                                Received by Partner
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600">No appointments found</p>
                                <p className="text-gray-400 text-sm">This service boy hasn't been assigned any appointments yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}