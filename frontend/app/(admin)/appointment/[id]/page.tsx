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
import { MapPin, Calendar, User, Phone, FileText, Upload, Trash2, PinIcon, Locate, LocationEdit, Download, Wallet, Building2, Mail } from 'lucide-react';

interface Address {
    area: string;
    landmark: string;
    pincode: string;
    district: string;
    state: string;
    lat: string;
    lng: string;
}

interface BookedByUser {
    firstName: string;
    lastName: string;
    phoneNumber: string;
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
}

interface ServiceId {
    id: number;
    title: string;
    price: string;
    bannerUrl: string;
    isHomeServiceAvail: boolean;
    zoneId: number;
    partnerId: number;
    partner: Partner;
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
    bookedByUser: BookedByUser;
    serviceId: ServiceId;
    addressId: number | null;
    status: string;
    createdAt: string;
    address: Address | null;
    isReportUploaded: boolean;
    reportName: string | null;
    appointementId: string;
    isPaid: boolean;
    modeOfPayment: string;
}

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
            formData.append('appointementId', appointment?.appointementId as string);

            toast.info('Uploading report...', { autoClose: false, toastId: 'uploading' });

            const res = await axiosClient.post(`/appointment/uploadreport/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status == 200) {
                toast.success('Report uploaded successfully!');
                setSelectedFile(null);
                setAppointment(res.data.appointment);
            }
            else {
                toast.error(res.data.error)
            }

        } catch (err: any) {
            toast.dismiss('uploading');
            toast.error(err.response.data.error)
            console.error('Error uploading report:', err);
        }
        finally {
            toast.dismiss('uploading');
        }
    };

    const handleDeleteAppointment = async (): Promise<void> => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        try {
            toast.info('Deleting appointment...', { autoClose: false, toastId: 'deleting' });

            const res = await axiosClient.delete(`/appointment/deleteappointement/${id}`);
            if (res.status == 200) {
                toast.dismiss('deleting');
                toast.success('Appointment deleted successfully');
                router.back();
            }
            else {
                toast.error(res.data.error)
            }
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

    const handleUpdateStatus = async (status: string) => {
        try {
            const res = await axiosClient.post('/appointment/updatestatus', {
                status: status,
                appointmentId: id
            });

            if (res.status == 200) {
                toast.success("Appointment status changed successfully");
                setAppointment(res.data.appointment);
            }
            else {
                toast.error("Unable to change the status")
            }
        } catch (error) {
            console.log(error);
            toast.error("Unable to change the status")
        }
    }

    const handleMarkAsPaid = async (Paidstatus: string) => {
        if (Paidstatus == 'false') return toast.info("Already marked as not paid")

        try {
            const res = await axiosClient.post('/appointment/markaspaid', {
                appointmentId: id
            });

            if (res.status == 200) {
                toast.success("Marked as paid");
                setAppointment(res.data.appointment);
            }
            else {
                toast.error("Unable to change the payment status")
            }
        } catch (error) {
            console.log(error);
            toast.error("Unable to change the payment status")
        }
    }

    return (
        <div className="container mx-auto p-4 w-full">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold">Appointment ID: {appointment.appointementId}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Patient Information</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                        appointment.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-800' :
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
                            <label className="text-sm text-gray-500">Service Details</label>
                            <p className="font-medium text-lg">{appointment.serviceId.title}</p>
                            <p className="text-sm text-green-600 font-semibold">Price: ₹{appointment.serviceId.price}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs ${appointment.serviceId.isHomeServiceAvail ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {appointment.serviceId.isHomeServiceAvail ? 'Home Service Available' : 'In-Clinic Only'}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Partner Hospital</label>
                            <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                <div className="flex items-center mb-2">
                                    <Building2 className="h-4 w-4 mr-2 text-gray-600" />
                                    <p className="font-medium">{appointment.serviceId.partner.hospitalName}</p>
                                    {appointment.serviceId.partner.isSubscribed && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Subscribed
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center mb-1">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">{appointment.serviceId.partner.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">{appointment.serviceId.partner.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Appointment Booked By</label>
                            <div className="flex items-center mt-1">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <p>{appointment.bookedByUser.firstName} {appointment.bookedByUser.lastName}</p>
                            </div>
                            <div className="flex items-center mt-1">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                <p>{appointment.bookedByUser.phoneNumber}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Payment Information</label>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center">
                                    <Wallet className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="capitalize">{appointment.modeOfPayment}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${appointment.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {appointment.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {appointment.address && (
                            <>
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
                            </>
                        )}

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
                        {appointment.status == 'COMPLETED' && !(appointment.isReportUploaded) && (
                            <>
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
                            </>
                        )}

                        {!appointment.isPaid && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Status</label>
                                <select 
                                    className='w-full h-10 px-3 pr-10 font-semibold border border-slate-300 rounded-md' 
                                    onChange={(e) => handleMarkAsPaid(e.target.value)} 
                                    value={appointment.isPaid ? 'Paid' : 'Not Paid'}
                                >
                                    <option value="Not Paid">Mark as Not Paid</option>
                                    <option value="Paid">Mark as Paid</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Appointment Status</label>
                            <select 
                                className='w-full h-10 px-3 pr-10 font-semibold border border-slate-300 rounded-md' 
                                onChange={(e) => handleUpdateStatus(e.target.value)} 
                                value={appointment.status}
                            >
                                <option value="SCHEDULED">Mark as Scheduled</option>
                                <option value="ACCEPTED">Mark as Accepted</option>
                                <option value="COMPLETED">Mark as Completed</option>
                                <option value="CANCELLED">Mark as Cancelled</option>
                            </select>
                        </div>

                        {appointment.isReportUploaded && appointment.reportName && (
                            <>
                                <div>
                                    <a href={`${process.env.NEXT_PUBLIC_IMAGE_URL}/reports/${appointment.reportName}`} download={true} target='_blank'>
                                        <Button
                                            variant="default"
                                            className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Report
                                        </Button>
                                    </a>
                                </div>
                                <Separator />
                            </>
                        )}

                        {appointment.address && (
                            <a href={`https://maps.google.com/?q=${appointment.address.lat},${appointment.address.lng}`} target='_blank'>
                                <Button
                                    variant="default"
                                    className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
                                >
                                    <LocationEdit className="h-4 w-4 mr-2" />
                                    Get Location
                                </Button>
                            </a>
                        )}

                        <Separator />

                        <div>
                            <Button
                                variant="destructive"
                                className="w-full cursor-pointer"
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