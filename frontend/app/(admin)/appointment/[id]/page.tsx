"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/lib/axiosClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Separator
} from '@/components/ui/separator';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useParams } from 'next/navigation';
import { MapPin, Calendar, User, Phone, FileText, Upload, Trash2, ArrowLeft } from 'lucide-react';

interface Address {
    area: string;
    landmark: string;
    pincode: string;
    district: string;
    state: string;
    lat: string;
    lng: string;
}

interface BookedBy {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

interface Service {
    title: string;
    price: string;
    bannerUrl: string;
}

interface Appointment {
    id: number;
    patientFirstName: string;
    patientLastName: string;
    patientAge: string;
    gender: string;
    referringDoctor: string;
    additionalPhoneNumber: string;
    userId: number;
    serviceId: number;
    addressId: number;
    status: string;
    createdAt: string;
    bookedBy: BookedBy;
    service: Service;
    address: Address;
}

interface AppointmentDetailsProps { }

const AppointmentDetails = () => {
    const router = useRouter();
    const { id } = useParams();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            fetchAppointmentDetails();
        }
    }, [id]);

    const fetchAppointmentDetails = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/appointment/getSpecificappointment/${id}`);
            setAppointment(response.data.appointment);
            setError(null);
        } catch (err) {
            setError('Failed to load appointment details. Please try again.');
            toast.error('Failed to load appointment details');
            console.error('Error fetching appointment details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async (): Promise<void> => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('report', selectedFile);
            formData.append('appointmentId', id as string);

            toast.info('Uploading report...', { autoClose: false, toastId: 'uploading' });

            // Replace with your actual upload endpoint
            await axiosClient.post('/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.dismiss('uploading');
            toast.success('Report uploaded successfully!');
            setSelectedFile(null);
            // Refresh appointment data
            fetchAppointmentDetails();
        } catch (err) {
            toast.dismiss('uploading');
            toast.error('Failed to upload report. Please try again.');
            console.error('Error uploading report:', err);
        }
    };

    const handleDeleteAppointment = async (): Promise<void> => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        try {
            toast.info('Deleting appointment...', { autoClose: false, toastId: 'deleting' });
            await axiosClient.delete(`/appointment/delete/${id}`);
            toast.dismiss('deleting');
            toast.success('Appointment deleted successfully');
            router.push('/appointments'); // Redirect to appointments list
        } catch (err) {
            toast.dismiss('deleting');
            toast.error('Failed to delete appointment. Please try again.');
            console.error('Error deleting appointment:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg font-medium">Loading appointment details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!appointment) {
        return (
            <Alert className="max-w-2xl mx-auto mt-8">
                <AlertTitle>No Appointment Found</AlertTitle>
                <AlertDescription>The requested appointment could not be found.</AlertDescription>
            </Alert>
        );
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="container mx-auto p-4 w-full">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold">Appointment Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span>Patient Information</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                }`}>
                                {appointment.status}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Patient Name</label>
                                <p className="font-medium">{appointment.patientFirstName} {appointment.patientLastName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Age / Gender</label>
                                <p className="font-medium">{appointment.patientAge} / {appointment.gender}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Referring Doctor</label>
                                <p className="font-medium">{appointment.referringDoctor || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Phone Number</label>
                                <p className="font-medium">{appointment.additionalPhoneNumber}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Service</label>
                            <p className="font-medium">{appointment.service.title}</p>
                            <p className="text-sm">Price: ₹{appointment.service.price}</p>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Appointment Booked By</label>
                            <div className="flex items-center mt-1">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <p>{appointment.bookedBy.firstName} {appointment.bookedBy.lastName}</p>
                            </div>
                            <div className="flex items-center mt-1">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                <p>{appointment.bookedBy.phoneNumber}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Address</label>
                            <div className="flex items-start mt-1">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                                <p>
                                    {appointment.address.area}, {appointment.address.landmark},
                                    {appointment.address.district}, {appointment.address.state} - {appointment.address.pincode}
                                </p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Appointment Date & Time</label>
                            <div className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <p>{formatDate(appointment.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Upload Report</label>
                            <div className="flex flex-col space-y-2">
                                <input
                                    type="file"
                                    id="report"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="report"
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {selectedFile ? selectedFile.name : 'Select File'}
                                </label>
                                <Button
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile}
                                    className="w-full"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Upload Report
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleDeleteAppointment}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleteConfirm ? 'Confirm Delete' : 'Delete Appointment'}
                            </Button>
                            {deleteConfirm && (
                                <p className="text-xs text-red-500 mt-2">
                                    Click again to confirm deletion. This action cannot be undone.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AppointmentDetails;