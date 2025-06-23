"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, User, Mail, Lock, Search, Eye, EyeOff, Phone, LocateFixed, Loader, AlertTriangle, RefreshCw, List, MapPin, Tractor, Building2 } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface ServiceBoyItem {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: boolean;
    isActive: boolean;
    partnerId: number;
    partner: {
        id: number;
        hospitalName: string;
        email: string;
        phoneNumber: string;
        zoneId: number;
        addressId: number;
        isSubscribed: boolean;
    };
    Count: {
        appointment: number;
    };
}

interface ApiResponse {
    message: string;
    serviceBoys: ServiceBoyItem[];
}

export default function ServiceBoyManagement() {
    const redirect = useRouter()
    
    // Data states
    const [serviceBoys, setServiceBoys] = useState<ServiceBoyItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Loading states
    const [isLoadingServiceBoys, setIsLoadingServiceBoys] = useState<boolean>(true);
    const [deletingServiceBoyIds, setDeletingServiceBoyIds] = useState<number[]>([]);

    // Error states
    const [serviceBoysFetchError, setServiceBoysFetchError] = useState<string | null>(null);

    const fetchServiceBoys = async () => {
        setIsLoadingServiceBoys(true);
        setServiceBoysFetchError(null);

        try {
            const res = await axiosClient.get('/serviceboy/getallserviceboy');

            if (res.status === 200) {
                const data: ApiResponse = res.data;
                setServiceBoys(data.serviceBoys || []);
                toast.success(data.message);
            } else {
                throw new Error("Failed to fetch service boys");
            }
        } catch (error: any) {
            console.error("Fetch service boys error:", error);
            const errorMessage = error.response?.data?.error || "Unable to fetch service boys. Please try again.";
            setServiceBoysFetchError(errorMessage);
            toast.error("Failed to load service boys");
        } finally {
            setIsLoadingServiceBoys(false);
        }
    };

    useEffect(() => {
        fetchServiceBoys();
    }, []);

    const handleDeleteServiceBoy = async (id: number) => {
        // Add the ID to the deleting array
        setDeletingServiceBoyIds(prev => [...prev, id]);

        try {
            const res = await axiosClient.delete(`/serviceboy/deleteserviceboy/${id}`);

            if (res.status === 200) {
                toast.success("Service boy deleted successfully");
                // Remove the service boy from the local state
                setServiceBoys(prev => prev.filter(serviceBoy => serviceBoy.id !== id));
            } else {
                toast.error("Unable to delete service boy");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Unable to delete service boy. Please try again.";
            toast.error(errorMessage);
        } finally {
            // Remove the ID from the deleting array
            setDeletingServiceBoyIds(prev => prev.filter(itemId => itemId !== id));
        }
    };

    // Filter service boys based on search query
    const filteredServiceBoys = serviceBoys.filter(serviceBoy =>
        serviceBoy.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceBoy.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceBoy.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceBoy.phoneNumber.includes(searchQuery) ||
        serviceBoy.partner.hospitalName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-5 h-screen">
            
            {/* Service Boys List Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <List size={18} className="mr-2" /> Service Boys Overview
                    </h2>

                    <button
                        onClick={fetchServiceBoys}
                        disabled={isLoadingServiceBoys}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                        title="Refresh service boys list"
                    >
                        <RefreshCw size={16} className={`mr-1 ${isLoadingServiceBoys ? 'animate-spin' : ''}`} />
                        <span className="text-sm">Refresh</span>
                    </button>
                </div>

                {/* Stats Cards */}
                {!isLoadingServiceBoys && !serviceBoysFetchError && serviceBoys.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <User size={20} className="text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total Service Boys</p>
                                    <p className="text-2xl font-bold text-blue-700">{serviceBoys.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Online</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {serviceBoys.filter(sb => sb.status).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Offline</p>
                                    <p className="text-2xl font-bold text-red-700">
                                        {serviceBoys.filter(sb => !sb.status).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error state for service boys list */}
                {serviceBoysFetchError && !isLoadingServiceBoys && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
                        <div className="flex items-center text-red-700">
                            <AlertTriangle size={18} className="mr-2" />
                            <span>{serviceBoysFetchError}</span>
                        </div>
                        <button
                            onClick={fetchServiceBoys}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center text-sm"
                        >
                            <RefreshCw size={14} className="mr-1" /> Try Again
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or partner hospital..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={isLoadingServiceBoys || !!serviceBoysFetchError}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Loading state */}
                {isLoadingServiceBoys && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader size={30} className="text-blue-500 animate-spin mb-3" />
                        <p className="text-gray-500">Loading service boys...</p>
                    </div>
                )}

                {/* Service Boys Table - Only show when not loading and no error */}
                {!isLoadingServiceBoys && !serviceBoysFetchError && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-xl overflow-hidden">
                            <thead className="bg-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <User size={14} className="mr-1" /> Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Phone size={14} className="mr-1" /> Phone Number
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Mail size={14} className="mr-1" /> Email
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Building2 size={14} className="mr-1" /> Partner Hospital
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Total Appointments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredServiceBoys.length > 0 ? (
                                    filteredServiceBoys.map((serviceBoy) => (
                                        <tr key={serviceBoy.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User size={16} className="text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {`${serviceBoy.firstName} ${serviceBoy.lastName}`}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {serviceBoy.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Phone size={14} className="text-gray-400 mr-2" />
                                                    {serviceBoy.phoneNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Mail size={14} className="text-gray-400 mr-2" />
                                                    {serviceBoy.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Building2 size={14} className="text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {serviceBoy.partner.hospitalName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Partner ID: {serviceBoy.partner.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {serviceBoy.status ? (
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                            <span className="text-green-600 font-medium text-sm">Online</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                            <span className="text-red-600 font-medium text-sm">Offline</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                        {serviceBoy.Count.appointment} appointments
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => redirect.push(`/addserviceboy/${serviceBoy.id}`)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title="View Service Boy Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteServiceBoy(serviceBoy.id)}
                                                        disabled={deletingServiceBoyIds.includes(serviceBoy.id)}
                                                        className={`text-red-500 hover:text-red-700 transition-colors ${
                                                            deletingServiceBoyIds.includes(serviceBoy.id) 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : 'cursor-pointer'
                                                        }`}
                                                        title="Delete Service Boy"
                                                    >
                                                        {deletingServiceBoyIds.includes(serviceBoy.id) ? (
                                                            <Loader size={18} className="animate-spin" />
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
                                            {searchQuery ? 
                                                "No service boys found matching your search" : 
                                                "No service boys found"
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty state - Only show when not loading, no error, and no service boys */}
                {!isLoadingServiceBoys && !serviceBoysFetchError && serviceBoys.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                        <Tractor size={40} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-1">No service boys found</p>
                        <p className="text-gray-400 text-sm">Add a new service boy to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}