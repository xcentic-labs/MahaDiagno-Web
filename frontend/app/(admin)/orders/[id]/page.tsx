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
import { MapPin, Calendar, User, Phone, Package, Trash2, LocationEdit, Wallet, Building2, Mail, ShoppingBag, Pill, ImageIcon } from 'lucide-react';

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

interface User {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phoneNumber: string;
}

interface PharmacyVendor {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    shopName: string;
    imageUrl: string;
    isVerified: boolean;
    isActive: boolean;
    amount: number;
    addressId: number;
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

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    orderId: number;
    medicineId: number;
    medicine: Medicine;
}

interface Order {
    id: number;
    totalAmount: number;
    isPaid: boolean;
    modeOfPayment: string;
    userId: number;
    pharmacyVendorId: number;
    addressId: number;
    orderstatus: 'PLACED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    razorpaySignature: string | null;
    razorpayRefundId: string | null;
    createdAt: string;
    updatedAt: string;
    orderItem: OrderItem[];
    user: User;
    pharmacyVendor: PharmacyVendor;
    address: Address;
}

interface ApiResponse {
    data: Order;
}

const OrderDetails = () => {
    const router = useRouter();
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/pharmacy/order/orders/${id}`);
            setOrder(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load order details. Please try again.');
            toast.error('Failed to load order details');
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (): Promise<void> => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        try {
            toast.info('Deleting order...', { autoClose: false, toastId: 'deleting' });

            const res = await axiosClient.delete(`/pharmacy/order/orders/${id}`);
            if (res.status == 200) {
                toast.dismiss('deleting');
                toast.success('Order deleted successfully');
                router.back();
            }
            else {
                toast.error('Failed to delete order');
            }
        } catch (err) {
            toast.dismiss('deleting');
            toast.error('Failed to delete order. Please try again.');
            console.error('Error deleting order:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg font-medium">Loading order details...</div>
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

    if (!order) {
        return (
            <Alert className="max-w-2xl mx-auto mt-8">
                <AlertTitle>No Order Found</AlertTitle>
                <AlertDescription>The requested order could not be found.</AlertDescription>
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

    const formatCurrency = (amount: number): string => {
        return `₹${amount.toFixed(2)}`;
    };

    const getUserFullName = (user: User): string => {
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            const res = await axiosClient.patch(`/pharmacy/order/orders/${id}/status`, {
                orderstatus: status
            });

            if (res.status == 200) {
                toast.success("Order status changed successfully");
                fetchOrderDetails();
            }
            else {
                toast.error("Unable to change the status")
            }
        } catch (error) {
            console.log(error);
            toast.error("Unable to change the status")
        }
    }

    const handleMarkAsPaid = async (paidStatus: string) => {
        if (paidStatus == 'false') return toast.info("Already marked as not paid")

        try {
            const res = await axiosClient.patch(`/pharmacy/order/orders/${id}`, {
                isPaid: paidStatus === 'true'
            });

            if (res.status == 200) {
                toast.success("Payment status updated");
                fetchOrderDetails();
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
        <div className="container mx-auto p-4 w-full bg-white">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold">Order ID: #{order.id}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Order Information</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.orderstatus === 'PLACED' ? 'bg-yellow-100 text-yellow-800' :
                                order.orderstatus === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                                order.orderstatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {order.orderstatus}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Customer Name</label>
                                <p className="font-medium">{getUserFullName(order.user)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Phone Number</label>
                                <p className="font-medium">{order.user.phoneNumber}</p>
                            </div>
                            {order.user.email && (
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="font-medium">{order.user.email}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-gray-500">Total Amount</label>
                                <p className="font-semibold text-lg text-green-600">{formatCurrency(order.totalAmount)}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Pharmacy Vendor Details</label>
                            <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                <div className="flex items-center mb-2">
                                    <Building2 className="h-4 w-4 mr-2 text-gray-600" />
                                    <p className="font-medium">{order.pharmacyVendor.shopName}</p>
                                    {order.pharmacyVendor.isVerified && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Verified
                                        </span>
                                    )}
                                    {order.pharmacyVendor.isActive && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center mb-1">
                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">{order.pharmacyVendor.name}</p>
                                </div>
                                <div className="flex items-center mb-1">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">{order.pharmacyVendor.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">{order.pharmacyVendor.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500 mb-3 block">Order Items ({order.orderItem.length})</label>
                            <div className="space-y-3">
                                {order.orderItem.map((item: OrderItem) => (
                                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex gap-4">
                                            <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                                                {item.medicine.imageUrl ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.medicine.imageUrl}`}
                                                        alt={item.medicine.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <Pill className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-base">{item.medicine.name}</h4>
                                                <p className="text-sm text-gray-600">Brand: {item.medicine.brand}</p>
                                                <p className="text-sm text-gray-500">{item.medicine.quantityDescription}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-gray-600">Qty: <span className="font-medium">{item.quantity}</span></span>
                                                        <span className="text-sm text-gray-600">Price: <span className="font-medium">{formatCurrency(item.medicine.finalPrice)}</span></span>
                                                    </div>
                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(item.quantity * item.medicine.finalPrice)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Payment Information</label>
                            <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <Wallet className="h-4 w-4 mr-2 text-gray-400" />
                                        <p className="text-sm text-gray-600">Payment Method: <span className="font-medium capitalize">{order.modeOfPayment}</span></p>
                                    </div>
                                    {/* <span className={`px-3 py-1 rounded-full text-sm ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span> */}
                                </div>
                                {order.razorpayOrderId && (
                                    <div className="text-xs text-gray-500 space-y-1 mt-2">
                                        <p>Razorpay Order ID: {order.razorpayOrderId}</p>
                                        {order.razorpayPaymentId && <p>Payment ID: {order.razorpayPaymentId}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {order.address && (
                            <>
                                <div className="mt-4">
                                    <label className="text-sm text-gray-500">Delivery Address</label>
                                    <div className="flex items-start mt-1">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                                        <p>
                                            {order.address.area}, {order.address.landmark},
                                            {order.address.district}, {order.address.state} - {order.address.pincode}
                                        </p>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                            </>
                        )}

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Order Placed</label>
                                <div className="flex items-center mt-1">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Last Updated</label>
                                <div className="flex items-center mt-1">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-sm">{formatDate(order.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!order.isPaid && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Mode</label>
                                <div
                                    className='w-full py-2 px-3 pr-10 font-semibold border border-slate-300 rounded-md' 
                                    
                                >
                                    {
                                        order.modeOfPayment === 'cash' ? 'Cash on Delivery' : 'Online Payment Razorpay'
                                        
                                    }
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Order Status</label>
                            <select 
                                className='w-full h-10 px-3 pr-10 font-semibold border border-slate-300 rounded-md' 
                                onChange={(e) => handleUpdateStatus(e.target.value)} 
                                value={order.orderstatus}
                            >
                                <option value="PLACED">Mark as Placed</option>
                                <option value="DISPATCHED">Mark as Dispatched</option>
                                <option value="DELIVERED">Mark as Delivered</option>
                                <option value="CANCELLED">Mark as Cancelled</option>
                            </select>
                        </div>

                        {order.address && (
                            <>
                                <Separator />
                                <a href={`https://maps.google.com/?q=${order.address.lat},${order.address.lng}`} target='_blank'>
                                    <Button
                                        variant="default"
                                        className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
                                    >
                                        <LocationEdit className="h-4 w-4 mr-2" />
                                        View on Map
                                    </Button>
                                </a>
                            </>
                        )}

                        <Separator />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrderDetails;
