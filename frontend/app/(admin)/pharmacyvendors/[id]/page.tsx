"use client"
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Store,
    Package,
    CheckCircle,
    XCircle,
    Shield,
    ShieldCheck,
    Image as ImageIcon,
    Eye,
    IndianRupee,
    Calendar,
    Activity
} from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define interfaces
interface Address {
    id: number;
    area: string;
    landmark: string;
    pincode: string;
    district: string;
    state: string;
    lat: string;
    lng: string;
    userId: number | null;
}

interface Order {
    id: number;
    totalAmount: number;
    isPaid: boolean;
    modeOfPayment: string;
    userId: number;
    pharmacyVendorId: number;
    addressId: number;
    orderstatus: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    razorpayRefundId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Medicine {
    id: number;
    name: string;
    brand: string;
    description: string;
    price: number;
    finalPrice: number;
    imageUrl: string;
    quantityDescription: string;
    isActive: boolean;
    medicineCategoryId: number;
    medicineSubCategoryId: number;
    pharmacyVendorId: number;
}

interface PharmacyVendor {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    shopName: string;
    imageUrl: string | null;
    isVerified: boolean;
    isActive: boolean;
    amount: number;
    addressId: number;
    address: Address;
    order: Order[];
    medicine: Medicine[];
}

export default function PharmacyVendorDetails() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params?.id as string;

    const [vendor, setVendor] = useState<PharmacyVendor | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);

    // Fetch vendor details
    const fetchVendorDetails = async () => {
        if (!vendorId) {
            setError("Invalid vendor ID");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const res = await axiosClient.get(`/pharmacy/pharmacyvendor/getmypharmacyvendorprofile/${vendorId}`);

            if (res.status === 200) {
                setVendor(res.data.data);
            } else {
                setError("Failed to load vendor details");
                toast.error("Unable to load vendor details");
            }
        } catch (error) {
            setError("An error occurred while fetching vendor details");
            toast.error("Unable to load vendor details");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle vendor verification
    const handleVerifyVendor = async () => {
        if (!vendor) return;

        try {
            setIsVerifying(true);
            const res = await axiosClient.patch(`/pharmacy/pharmacyvendor/verify/${vendor.id}`);

            if (res.status === 200) {
                toast.success(vendor.isVerified ? "Vendor unverified successfully" : "Vendor verified successfully");
                // Update local state
                setVendor({ ...vendor, isVerified: !vendor.isVerified });
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

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'PLACED':
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'CONFIRMED':
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate statistics
    const calculateStats = () => {
        if (!vendor) return { totalOrders: 0, totalRevenue: 0, activeMedicines: 0, paidOrders: 0 };

        const totalOrders = vendor.order.length;
        const totalRevenue = vendor.order.reduce((sum, order) => sum + order.totalAmount, 0);
        const activeMedicines = vendor.medicine.filter(med => med.isActive).length;
        const paidOrders = vendor.order.filter(order => order.isPaid).length;

        return { totalOrders, totalRevenue, activeMedicines, paidOrders };
    };

    useEffect(() => {
        fetchVendorDetails();
    }, [vendorId]);

    if (isLoading) {
        return (
            <div className="p-5 h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
                    <p className="text-gray-600">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="p-5 h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error || "Vendor not found"}</span>
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

    const stats = calculateStats();

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
                    <h1 className="text-2xl font-bold text-gray-800">Pharmacy Vendor Details</h1>
                </div>

                {/* Verification Button */}
                {
                    !vendor.isVerified && (
                        <button
                            onClick={handleVerifyVendor}
                            disabled={isVerifying}
                            className={`flex items-center px-4 py-2 rounded-md transition-colors ${vendor.isVerified
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                            ) : vendor.isVerified ? (
                                <XCircle size={16} className="mr-2" />
                            ) : (
                                <CheckCircle size={16} className="mr-2" />
                            )}
                            {isVerifying
                                ? 'Updating...'
                                : vendor.isVerified
                                    ? 'Unverify Vendor'
                                    : 'Verify Vendor'
                            }
                        </button>
                    )
                }
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                        </div>
                        <Package size={32} className="text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue}</p>
                        </div>
                        <IndianRupee size={32} className="text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Medicines</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.activeMedicines}</p>
                        </div>
                        <Activity size={32} className="text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Wallet Balance</p>
                            <p className="text-2xl font-bold text-gray-800">₹{vendor.amount}</p>
                        </div>
                        <IndianRupee size={32} className="text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Vendor Info */}
                <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="text-center">
                            {vendor.imageUrl ? (
                                <img
                                    src={`https://api.mahadiagno.com/${vendor.imageUrl}`}
                                    alt={vendor.name}
                                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                                    <ImageIcon size={48} className="text-gray-400" />
                                </div>
                            )}

                            <div className="flex items-center justify-center mb-2">
                                <h2 className="text-xl font-bold text-gray-800 mr-2">{vendor.name}</h2>
                                {vendor.isVerified ? (
                                    <ShieldCheck size={20} className="text-green-600" />
                                ) : (
                                    <Shield size={20} className="text-gray-400" />
                                )}
                            </div>

                            <div className="flex items-center justify-center mb-4">
                                <Store size={16} className="mr-2 text-blue-600" />
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {vendor.shopName}
                                </span>
                            </div>

                            <div className="flex items-center justify-center mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${vendor.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {vendor.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mt-4">
                                <div className="flex items-center justify-center">
                                    <Mail size={16} className="mr-2" />
                                    {vendor.email}
                                </div>
                                <div className="flex items-center justify-center">
                                    <Phone size={16} className="mr-2" />
                                    +91 {vendor.phoneNumber}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shop Address */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin size={18} className="mr-2" />
                            Shop Address
                        </h3>
                        <div className="text-gray-600 space-y-1">
                            <p>{vendor.address.area}</p>
                            <p>Landmark: {vendor.address.landmark}</p>
                            <p>{vendor.address.district}, {vendor.address.state}</p>
                            <p>Pincode: {vendor.address.pincode}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Lat: {vendor.address.lat}, Lng: {vendor.address.lng}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Medicines Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Package size={18} className="mr-2" />
                            Medicines ({vendor.medicine.length})
                        </h3>

                        {vendor.medicine.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vendor.medicine.map((medicine) => (
                                    <div
                                        key={medicine.id}
                                        className={`border rounded-lg p-4 ${medicine.isActive
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {medicine.imageUrl ? (
                                                <img
                                                    src={`https://api.mahadiagno.com/${medicine.imageUrl}`}
                                                    alt={medicine.name}
                                                    className="w-16 h-16 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                                                    <Package size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-gray-800">{medicine.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${medicine.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {medicine.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{medicine.brand}</p>
                                                <p className="text-xs text-gray-500 mb-2">{medicine.quantityDescription}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-400 line-through">₹{medicine.price}</span>
                                                    <span className="text-lg font-bold text-green-600">₹{medicine.finalPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{medicine.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No medicines available</p>
                        )}
                    </div>

                    {/* Orders Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Package size={18} className="mr-2" />
                            Recent Orders ({vendor.order.length})
                        </h3>

                        {vendor.order.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Order ID</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Amount</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Payment</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Date</th>
                                            <th className="text-left py-2 px-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendor.order.slice(0, 10).map((order) => (
                                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-800">#{order.id}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-800">₹{order.totalAmount}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.isPaid
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1 capitalize">
                                                            {order.modeOfPayment}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderstatus)}`}>
                                                        {order.orderstatus}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                                    <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => router.push(`/orders/${order.id}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                        title="View Order Details"
                                                    >
                                                        <Eye size={16} className="inline-block" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {vendor.order.length > 10 && (
                                    <p className="text-center text-sm text-gray-500 mt-4">
                                        Showing 10 of {vendor.order.length} orders
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No orders found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
