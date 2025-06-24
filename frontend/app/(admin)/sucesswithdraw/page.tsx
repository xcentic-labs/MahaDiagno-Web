"use client"
import { axiosClient } from "@/lib/axiosClient";
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock, Building2, CreditCard, Phone, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

// Type definitions
interface Partner {
    id: number;
    hospitalName: string;
    phoneNumber: string;
    email: string;
}

interface PaymentMethod {
    id: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    bankeeName: string;
}

interface WithdrawRequest {
    id: number;
    amount: number;
    status: "PENDING" | "SUCCESS" | "REJECTED";
    partnerId: number;
    paymentMethodId: number;
    createdAt: string;
    updatedAt: string;
    partner: Partner;
    paymentMethod: PaymentMethod;
}

interface WithdrawResponse {
    message: string;
    withdraw: WithdrawRequest[];
}

type StatusType = "PENDING" | "SUCCESS" | "REJECTED";

export default function Withdraw() {
    const [data, setData] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [visibleAccountNumbers, setVisibleAccountNumbers] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchwithdraw = async (): Promise<void> => {
            try {
                const res = await axiosClient.get<WithdrawResponse>('/withdraw/all?status=success');
                setData(res.data.withdraw);
            } catch (error) {
                console.error('Error fetching withdrawal requests:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchwithdraw();
    }, []);

    const handleStatusChange = async (id: number, status: StatusType , partnerId : number | string , amount : number): Promise<void> => {
        setProcessingId(id);
        try {
            await axiosClient.patch(`/withdraw/updatestatus/${id}`, {
                status ,
                partnerId,
                amount
            });
            
            // Update local state
            setData(prevData => 
                prevData.map(item => 
                    item.id === id ? { ...item, status } : item
                )
            );

            toast.success("Approved Sucessfully");
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error("Failed to update status. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status: StatusType): string => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: StatusType)=> {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleAccountNumberVisibility = (requestId: number): void => {
        setVisibleAccountNumbers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(requestId)) {
                newSet.delete(requestId);
            } else {
                newSet.add(requestId);
            }
            return newSet;
        });
    };

    const formatAccountNumber = (accountNumber: string, requestId: number): string => {
        const isVisible = visibleAccountNumbers.has(requestId);
        return isVisible ? accountNumber : `****${accountNumber.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Requests</h1>
                    <p className="text-gray-600">Manage and process withdrawal requests from partners</p>
                </div>

                {data.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <CreditCard className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</h3>
                        <p className="text-gray-500">There are no withdrawal requests at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {data.map((request: WithdrawRequest) => (
                            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <CreditCard className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Withdrawal Request #{request.id}
                                                </h3>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    {formatAmount(request.amount)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Created: {formatDate(request.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="text-sm font-medium">{request.status}</span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        {/* Partner Information */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                Partner Details
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Hospital Name</p>
                                                    <p className="font-medium text-gray-900">{request.partner.hospitalName}</p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{request.partner.phoneNumber}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{request.partner.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method Information */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Payment Details
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Bank Name</p>
                                                    <p className="font-medium text-gray-900">{request.paymentMethod.bankName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Account Number</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-mono text-gray-900">
                                                            {formatAccountNumber(request.paymentMethod.accountNumber, request.id)}
                                                        </p>
                                                        <button
                                                            onClick={() => toggleAccountNumberVisibility(request.id)}
                                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                            title={visibleAccountNumbers.has(request.id) ? "Hide account number" : "Show account number"}
                                                        >
                                                            {visibleAccountNumbers.has(request.id) ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">IFSC Code</p>
                                                        <p className="font-mono text-gray-900">{request.paymentMethod.ifscCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Account Holder</p>
                                                        <p className="font-medium text-gray-900">{request.paymentMethod.bankeeName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {request.status === 'PENDING' && (
                                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleStatusChange(request.id, 'SUCCESS' , request.partnerId , request.amount)}
                                                disabled={processingId === request.id}
                                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>{processingId === request.id ? 'Processing...' : 'Approve'}</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(request.id, 'REJECTED' , request.partnerId , request.amount)}
                                                disabled={processingId === request.id}
                                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>{processingId === request.id ? 'Processing...' : 'Reject'}</span>
                                            </button>
                                        </div>
                                    )}

                                    {request.status !== 'PENDING' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-500">
                                                This request has been {request.status.toLowerCase()}.
                                                {request.updatedAt && ` Updated: ${formatDate(request.updatedAt)}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}