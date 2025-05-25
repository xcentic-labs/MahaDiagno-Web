"use client"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { axiosClient } from "@/lib/axiosClient";

// Type definitions
interface Zone {
    id: number;
    state: string;
    district: string;
    pincode: string;
}

interface service {
    title: string;
    price: string;
}

interface Appointment {
    id: number;
    isPaid: boolean;
    modeOfPayment: string;
    status: "ACCEPTED" | "SCHEDULED" | "REJECTED" | "COMPLETED";
    isRecivesByAdmin: boolean;
    service: service;
    appointmentId: string
}

interface ServiceBoy {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    zone: Zone;
    status: boolean;
    appointments: Appointment[];
}

interface ApiResponse {
    message: string;
    serviceboy: ServiceBoy;
}

export default function ServiceBoy() {
    const { id } = useParams<{ id: string }>();
    const [serviceBoyData, setServiceBoyData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);
    const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            fetchServiceBoyData();
        }
    }, [id]);

    const fetchServiceBoyData = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/serviceboy/getspecficserviceboy/${id}`)
            if (response.status == 200) {
                setServiceBoyData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentAction = async () => {
        setIsUpdateLoading(true);
        try {
           
            const res = await axiosClient.patch(`/serviceboy/updatedcashrecived/${id}`)

            if (res.status == 200) {
                toast.success("Updated Sucessfully");
                fetchServiceBoyData();
            }
            else {
                toast.error("Unable to update status");
            }
        } catch (err) {
            toast.error("Unable to update status");
        } finally {
            setIsUpdateLoading(false);
        }
    };

    // Calculate cash to be received
    const getCashToBeReceived = () => {
        if (!serviceBoyData?.serviceboy.appointments) return 0;

        return serviceBoyData.serviceboy.appointments
            .filter(apt =>
                apt.modeOfPayment.toLowerCase() === 'cash' &&
                apt.isPaid === true &&
                apt.isRecivesByAdmin === false
            )
            .reduce((total, apt) => total + parseFloat(apt.service?.price || '0'), 0);
    };

    // Get cash log appointments
    const getCashLogAppointments = () => {
        if (!serviceBoyData?.serviceboy.appointments) return [];

        return serviceBoyData.serviceboy.appointments.filter(apt =>
            apt.modeOfPayment.toLowerCase() === 'cash' &&
            apt.isPaid === true &&
            apt.isRecivesByAdmin === false
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchServiceBoyData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!serviceBoyData) return null;

    const { serviceboy } = serviceBoyData;
    const cashToBeReceived = getCashToBeReceived();
    const cashLogAppointments = getCashLogAppointments();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Service Boy Details</h1>
                </div>

                {/* User Information Card */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="bg-gray-100 px-6 py-3 rounded-t-lg">
                        <h2 className="font-medium text-gray-700">User Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">First Name</p>
                                    <p className="text-gray-900">{serviceboy.firstName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Last Name</p>
                                    <p className="text-gray-900">{serviceboy.lastName}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="text-gray-900">{serviceboy.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                    <p className="text-gray-900">{serviceboy.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                                    <p className="text-gray-900">{serviceboy.id}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Zone</p>
                                    <p className="text-gray-900">
                                        {serviceboy.zone.district}, {serviceboy.zone.state} - {serviceboy.zone.pincode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${serviceboy.status
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {serviceboy.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            {/* Initials Circle */}
                            <div className="ml-6">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-medium text-gray-600">
                                        {serviceboy.firstName.charAt(0)}{serviceboy.lastName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cash Summary Card */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="bg-red-100 px-6 py-3 rounded-t-lg flex justify-between">
                        <h2 className="font-medium text-red-800 flex items-center">
                            💰 Cash to be Received
                        </h2>

                        {
                            isUpdateLoading ?
                                <p className="h-6 w-6 rounded-full border-3 border-b-0 border-l-0 border-green-600 animate-spin"></p>
                                :
                                <button
                                    onClick={() => handlePaymentAction()}
                                    // disabled={updatingPayment === appointment.id}
                                    className={`px-3 py-2 rounded text-xs font-medium transition-colors bg-green-600 text-white hover:bg-green-700 cursor-pointer}`}>
                                    Mark as Received
                                </button>
                        }

                    </div>
                    <div className="p-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600">₹{cashToBeReceived.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Total SCHEDULED cash payments ({cashLogAppointments.length} appointments)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cash Log Table */}
                {cashLogAppointments.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between ">
                            <h2 className="font-medium text-slate-800 flex items-center">
                                💸 Cash Log - SCHEDULED Collections
                            </h2>
                            <span className="text-sm text-red-600 font-medium">
                                Count: {cashLogAppointments.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Service Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cashLogAppointments.map((appointment) => (
                                        <tr key={appointment.id} className="">
                                            <td className="px-6 py-4 text-sm text-gray-900">{appointment.appointmentId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {appointment.service?.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                                                ₹{appointment.service?.price}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                    appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* All Appointments Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-medium text-gray-700 flex items-center">
                            📅 All Appointments
                        </h2>
                        <span className="text-sm text-gray-500">
                            Total: {serviceboy.appointments?.length || 0}
                        </span>
                    </div>

                    {serviceboy.appointments && serviceboy.appointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {serviceboy.appointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{appointment.appointmentId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {appointment.service?.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${appointment.modeOfPayment.toLowerCase() === 'cash'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {appointment.modeOfPayment}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                ₹{appointment.service?.price}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {appointment.isPaid ? (
                                                    <span className="text-green-600 font-medium">Yes</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">No</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                    appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {appointment.isRecivesByAdmin ? (
                                                    <span className="text-green-600 font-medium">✓ Yes</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">✗ No</span>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">No appointments found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}