"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, User, Mail, Lock, Search, Eye, EyeOff, Phone, LocateFixed, Loader, AlertTriangle, RefreshCw, List, MapPin, Tractor } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

interface ServiceBoyForm {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    zoneId: string | number;
}

interface ServiceBoyItem {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: boolean;
    zone?: {
        id: number;
        district: string;
        state: string;
        pincode: string;
    };
    totalAppointments: number
}

interface ZoneItem {
    id: number;
    state: string;
    district: string;
    pincode: string;
}

export default function ServiceBoyManagement() {
    // Form state
    const [newServiceBoy, setNewServiceBoy] = useState<ServiceBoyForm>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        zoneId: '',
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Data states
    const [serviceBoys, setServiceBoys] = useState<ServiceBoyItem[]>([]);
    const [zones, setZones] = useState<ZoneItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Loading states
    const [isLoadingZones, setIsLoadingZones] = useState<boolean>(true);
    const [isLoadingServiceBoys, setIsLoadingServiceBoys] = useState<boolean>(true);
    const [isAddingServiceBoy, setIsAddingServiceBoy] = useState<boolean>(false);
    const [deletingServiceBoyIds, setDeletingServiceBoyIds] = useState<number[]>([]);

    // Error states
    const [zonesFetchError, setZonesFetchError] = useState<string | null>(null);
    const [serviceBoysFetchError, setServiceBoysFetchError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>): void => {
        // Clear any add errors when user starts typing
        if (addError) setAddError(null);

        const { name, value } = e.target;
        setNewServiceBoy({
            ...newServiceBoy,
            [name]: value
        });
    };

    const fetchZones = async () => {
        setIsLoadingZones(true);
        setZonesFetchError(null);

        try {
            const res = await axiosClient.get('/zone/getzones');

            if (res.status === 200) {
                setZones(res.data.ZoneData);
            } else {
                throw new Error("Failed to fetch zones");
            }
        } catch (error: any) {
            console.error("Fetch zones error:", error);
            const errorMessage = error.response?.data?.error || "Unable to fetch zones. Please try again.";
            setZonesFetchError(errorMessage);
            toast.error("Failed to load zones");
        } finally {
            setIsLoadingZones(false);
        }
    };

    const fetchServiceBoys = async () => {
        setIsLoadingServiceBoys(true);
        setServiceBoysFetchError(null);

        try {
            const res = await axiosClient.get('/serviceboy/getallserviceboy');

            if (res.status === 200) {
                setServiceBoys(res.data.serviceBoys || []);
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
        fetchZones();
        fetchServiceBoys();
    }, []);

    const handleAddServiceBoy = async () => {
        // Form validation
        if (!newServiceBoy.firstName.trim() ||
            !newServiceBoy.lastName.trim() ||
            !newServiceBoy.email.trim() ||
            !newServiceBoy.password.trim() ||
            !newServiceBoy.phoneNumber.trim() ||
            !newServiceBoy.zoneId) {
            toast.warning("All fields are required");
            setAddError("All fields are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newServiceBoy.email)) {
            toast.warning("Please enter a valid email address");
            setAddError("Please enter a valid email address");
            return;
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(newServiceBoy.phoneNumber)) {
            toast.warning("Please enter a valid 10-digit phone number");
            setAddError("Please enter a valid 10-digit phone number");
            return;
        }

        setIsAddingServiceBoy(true);
        setAddError(null);

        try {
            const res = await axiosClient.post('/serviceboy/addserviceboy', newServiceBoy);

            if (res.status === 201) {
                toast.success("Service boy added successfully");
                setNewServiceBoy({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    password: '',
                    zoneId: '',
                });

                // Refresh the service boys list
                fetchServiceBoys();
            } else {
                setAddError("Unable to add the service boy");
                toast.error("Unable to add the service boy");
            }
        } catch (error: any) {
            console.error("Add service boy error:", error);
            const errorMessage = error.response?.data?.error || "Unable to add the service boy. Please try again.";
            setAddError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsAddingServiceBoy(false);
        }
    };

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
        serviceBoy.zone?.district.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Find zone name by ID
    const getZoneNameById = (zoneId: number) => {
        const zone = zones.find(zone => zone.id === zoneId);
        return zone ? zone.district : 'Unknown Zone';
    };

    return (
        <div className="p-5 h-screen">
            {/* Add New Service Boy Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <Plus size={18} className="mr-2" /> Add New Service Boy
                </h2>

                {addError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                        <AlertTriangle size={18} className="mr-2" />
                        <span>{addError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <User size={16} className="mr-1" /> First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={newServiceBoy.firstName}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter first name"
                            disabled={isAddingServiceBoy}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <User size={16} className="mr-1" /> Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={newServiceBoy.lastName}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter last name"
                            disabled={isAddingServiceBoy}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <Mail size={16} className="mr-1" /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={newServiceBoy.email}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter email address"
                            disabled={isAddingServiceBoy}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <Phone size={16} className="mr-1" />Phone Number
                        </label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={newServiceBoy.phoneNumber}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter Phone Number"
                            maxLength={10}
                            minLength={10}
                            disabled={isAddingServiceBoy}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <Lock size={16} className="mr-1" /> Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={newServiceBoy.password}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter password"
                                disabled={isAddingServiceBoy}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                disabled={isAddingServiceBoy}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <LocateFixed size={16} className="mr-1" />Zone
                        </label>
                        <div className="relative">
                            {isLoadingZones ? (
                                <div className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 flex items-center justify-center">
                                    <Loader size={16} className="animate-spin mr-2" />
                                    <span className="text-gray-500">Loading zones...</span>
                                </div>
                            ) : zonesFetchError ? (
                                <div className="border border-red-200 bg-red-50 rounded-md px-3 py-2 w-full flex items-center justify-between">
                                    <span className="text-red-600">Failed to load zones</span>
                                    <button
                                        onClick={fetchZones}
                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <select
                                    name="zoneId"
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onChange={handleInputChange}
                                    value={newServiceBoy.zoneId}
                                    disabled={isAddingServiceBoy}
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.district} - {zone.state} ({zone.pincode})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-end">
                    <button
                        onClick={handleAddServiceBoy}
                        disabled={isAddingServiceBoy || isLoadingZones || !!zonesFetchError}
                        className={`mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center font-medium ${(isAddingServiceBoy || isLoadingZones || !!zonesFetchError) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                    >
                        {isAddingServiceBoy ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" /> Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={16} className="mr-2 font-bold" /> Add Service Boy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Service Boys List Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <List size={18} className="mr-2" /> Service Boys List
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
                            placeholder="Search service boys..."
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
                                        First Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Last Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Total Appointments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <MapPin size={14} className="mr-1" /> Zone
                                        </div>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.firstName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.phoneNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {
                                                    serviceBoy.status ? 
                                                    <p className='text-green-600 font-bold animate-pulse'> &bull; Online</p>
                                                    :
                                                    <p className='text-red-600 font-bold'>Offline</p>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.totalAppointments}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {serviceBoy.zone?.district || getZoneNameById(Number(serviceBoy.zone?.id))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleDeleteServiceBoy(serviceBoy.id)}
                                                    disabled={deletingServiceBoyIds.includes(serviceBoy.id)}
                                                    className={`text-red-500 hover:text-red-700 transition-colors ${deletingServiceBoyIds.includes(serviceBoy.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                        }`}
                                                    title="Delete Service Boy"
                                                >
                                                    {deletingServiceBoyIds.includes(serviceBoy.id) ? (
                                                        <Loader size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No service boys found matching your search
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