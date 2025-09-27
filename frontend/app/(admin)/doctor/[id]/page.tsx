"use client"
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    GraduationCap,
    Briefcase,
    Users,
    CheckCircle,
    XCircle,
    Shield,
    ShieldCheck,
    Image as ImageIcon,
    Eye,
    Download
} from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define interfaces
interface Specialization {
    id: number;
    key: string;
    label: string;
    imageUrl?: string;
}

interface Experience {
    id: number;
    title: string;
    hospital: string;
    employmentType: string;
    from: string;
    to: string | null;
    currentlyWorking: boolean;
    doctorId: number;
}

interface Education {
    id: number;
    courseName: string;
    universityName: string;
    yearOfPassing: number;
    doctorId: number;
}

interface Timing {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    fee: number;
    doctorId: number;
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
    videoCallId: string;
}

interface Doctor {
    id: number;
    fName: string;
    lName: string;
    displayName: string;
    phoneNumber: string;
    email: string;
    clinicName: string;
    clinicAddress: string;
    imageUrl: string | null;
    specialization: Specialization;
    experience: Experience[];
    education: Education[];
    timings: Timing[];
    doctorappointment: Appointment[];
    isVerified: boolean;
}

export default function DoctorDetails() {
    const params = useParams();
    const router = useRouter();
    const doctorId = params?.id as string;

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);

    // Fetch doctor details
    const fetchDoctorDetails = async () => {
        if (!doctorId) {
            setError("Invalid doctor ID");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const res = await axiosClient.get(`/doctor/get/${doctorId}`);

            if (res.status === 200) {
                setDoctor(res.data);
            } else {
                setError("Failed to load doctor details");
                toast.error("Unable to load doctor details");
            }
        } catch (error) {
            setError("An error occurred while fetching doctor details");
            toast.error("Unable to load doctor details");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle doctor verification
    const handleVerifyDoctor = async () => {
        if (!doctor) return;

        try {
            setIsVerifying(true);
            const res = await axiosClient.patch(`/doctor/verify/${doctor.id}`);

            if (res.status === 200) {
                toast.success(doctor.isVerified ? "Doctor unverified successfully" : "Doctor verified successfully");
                // Update local state
                setDoctor({ ...doctor, isVerified: !doctor.isVerified });
            } else {
                toast.error("Failed to update verification status");
            }
        } catch (error) {
            console.error("Error updating verification status:", error);
            toast.error("An error occurred while updating verification status");
        } finally {
            setIsVerifying(false);
        }
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

    // Get status color
    const getStatusColor = (status: string) => {
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

    useEffect(() => {
        fetchDoctorDetails();
    }, [doctorId]);

    if (isLoading) {
        return (
            <div className="p-5 h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
                    <p className="text-gray-600">Loading doctor details...</p>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="p-5 h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error || "Doctor not found"}</span>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-800">Doctor Details</h1>
                </div>

                {/* Verification Button */}
                {
                    !doctor.isVerified ? (
                        <button
                            onClick={handleVerifyDoctor}
                            disabled={isVerifying}
                            className={`flex items-center px-4 py-2 rounded-md transition-colors ${doctor.isVerified
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                            ) : doctor.isVerified ? (
                                <XCircle size={16} className="mr-2" />
                            ) : (
                                <CheckCircle size={16} className="mr-2" />
                            )}
                            {isVerifying
                                ? 'Updating...'
                                : doctor.isVerified
                                    ? 'Unverify Doctor'
                                    : 'Verify Doctor'
                            }
                        </button>
                    ) :
                        ""
                }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Doctor Info */}
                <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="text-center">
                            {doctor.imageUrl ? (
                                <img
                                    src={`https://api.mahadiagno.com/${doctor.imageUrl}`}
                                    alt={doctor.displayName}
                                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                                    <ImageIcon size={48} className="text-gray-400" />
                                </div>
                            )}

                            <div className="flex items-center justify-center mb-2">
                                <h2 className="text-xl font-bold text-gray-800 mr-2">{doctor.displayName}</h2>
                                {doctor.isVerified ? (
                                    <ShieldCheck size={20} className="text-green-600" />
                                ) : (
                                    <Shield size={20} className="text-gray-400" />
                                )}
                            </div>

                            <div className="flex items-center justify-center mb-4">
                                {doctor.specialization.imageUrl && (
                                    <img
                                        src={`https://api.mahadiagno.com/${doctor.specialization.imageUrl}`}
                                        alt={doctor.specialization.label}
                                        className="w-6 h-6 mr-2 object-cover rounded"
                                    />
                                )}
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {doctor.specialization.label}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center justify-center">
                                    <Mail size={16} className="mr-2" />
                                    {doctor.email}
                                </div>
                                <div className="flex items-center justify-center">
                                    <Phone size={16} className="mr-2" />
                                    +91 {doctor.phoneNumber}
                                </div>
                                <div className="flex items-center justify-center">
                                    <MapPin size={16} className="mr-2" />
                                    {doctor.clinicName}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Address */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin size={18} className="mr-2" />
                            Clinic Address
                        </h3>
                        <p className="text-gray-600">{doctor.clinicAddress}</p>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Experience Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Briefcase size={18} className="mr-2" />
                            Experience ({doctor.experience.length})
                        </h3>

                        {doctor.experience.length > 0 ? (
                            <div className="space-y-4">
                                {doctor.experience.map((exp) => (
                                    <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                                        <h4 className="font-medium text-gray-800">{exp.title}</h4>
                                        <p className="text-gray-600">{exp.hospital}</p>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <span className="mr-2">{exp.employmentType}</span>
                                            <span>
                                                {exp.from} - {exp.currentlyWorking ? 'Present' : exp.to}
                                                {exp.currentlyWorking && (
                                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Currently Working
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No experience information available</p>
                        )}
                    </div>

                    {/* Education Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <GraduationCap size={18} className="mr-2" />
                            Education ({doctor.education.length})
                        </h3>

                        {doctor.education.length > 0 ? (
                            <div className="space-y-4">
                                {doctor.education.map((edu) => (
                                    <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                                        <h4 className="font-medium text-gray-800">{edu.courseName}</h4>
                                        <p className="text-gray-600">{edu.universityName}</p>
                                        <p className="text-sm text-gray-500">Year of Passing: {edu.yearOfPassing}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No education information available</p>
                        )}
                    </div>

                    {/* Timings Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Clock size={18} className="mr-2" />
                            Weekly Schedule
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctor.timings.map((timing) => (
                                <div
                                    key={timing.id}
                                    className={`p-3 rounded-lg border ${timing.isAvailable
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-gray-800">{timing.day}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${timing.isAvailable
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {timing.isAvailable ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>

                                    {timing.isAvailable ? (
                                        <div className="text-sm text-gray-600">
                                            <p>{formatTime(timing.startTime)} - {formatTime(timing.endTime)}</p>
                                            <p className="font-medium text-green-600">Fee: ₹{timing.fee}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Closed</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Appointments Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Users size={18} className="mr-2" />
                            Recent Appointments ({doctor.doctorappointment.length})
                        </h3>

                        {doctor.doctorappointment.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Patient</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Date</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Contact</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctor.doctorappointment.slice(0, 10).map((appointment) => (
                                            <tr key={appointment.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {appointment.patientFirstName} {appointment.patientLastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {appointment.patientAge} years, {appointment.patientGender}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-600">{formatDate(appointment.date)}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(appointment.createdAt)}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                    {appointment.isRescheduled && (
                                                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            Rescheduled
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-600">+91 {appointment.patientPhoneNumber}</p>
                                                </td>
                                                <td className="py-3 px-4 space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/doctorappointment/${appointment.id}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        <Eye size={16} className="inline-block mr-1" />
                                                    </button>
                                                    {
                                                        appointment.prescriptionUrl &&
                                                        <a
                                                            href={`https://api.mahadiagno.com/${appointment.prescriptionUrl}`}
                                                            download={`prescriptions/prescription_${appointment.id}_${appointment.patientFirstName}_${appointment.patientLastName}_${formatDate(appointment.date).replace(/\s/g, '_')}.pdf`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-600 hover:text-green-800 text-sm"
                                                            title="Download Prescription"
                                                        >
                                                            <Download size={16} className="inline-block mr-1" />
                                                        </a>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {doctor.doctorappointment.length > 10 && (
                                    <p className="text-center text-sm text-gray-500 mt-4">
                                        Showing 10 of {doctor.doctorappointment.length} appointments
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No appointments found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}