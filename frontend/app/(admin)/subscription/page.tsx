"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, User, Mail, Lock, Search, Eye, EyeOff, Loader, AlertTriangle, RefreshCw, Type, DollarSign, Hash, List, Layers, Edit, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { axiosClient } from '@/lib/axiosClient';
import { Layer } from 'recharts';

// Define TypeScript interfaces
interface subscriptionItem {
    id: number;
    subscriptionName: string;
    price: string,
    numberOfServiceBoys: string,
    timePeriod: string | number,
    benefits: string
}

interface NewSubscriptionForm {
    subscriptionName: string;
    price: string,
    timePeriod: string,
    numberOfServiceBoys: number | string,
    benefits: string
}

interface service {
    id: number,
    title: string,
    price: string,
    banner_url: string
}

export default function subscriptionManagement() {
    // subscription data states
    const [subscription, setSubscription] = useState<subscriptionItem[]>([]);
    const [newSubscription, setNewSubscription] = useState<NewSubscriptionForm>({
        subscriptionName: '',
        price: '',
        timePeriod: '',
        numberOfServiceBoys: '',
        benefits: ''
    });

    // Update subscription states
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [currentEditingSubscription, setCurrentEditingSubscription] = useState<subscriptionItem | null>(null);
    const [updateSubscription, setUpdateSubscription] = useState<NewSubscriptionForm>({
        subscriptionName: '',
        price: '',
        timePeriod: '',
        numberOfServiceBoys: '',
        benefits: ''
    });

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAddingSubscription, setIsAddingSubscription] = useState<boolean>(false);
    const [isUpdatingSubscription, setIsUpdatingSubscription] = useState<boolean>(false);
    const [deletingsubscriptionIds, setDeletingsubscriptionIds] = useState<number[]>([]);

    // Error states
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Service 
    const [services, setServices] = useState<service[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        // Clear any add errors when user starts typing
        if (addError) setAddError(null);

        const { name, value } = e.target;
        setNewSubscription({
            ...newSubscription,
            [name]: value
        });
    };

    const handleUpdateInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        // Clear any update errors when user starts typing
        if (updateError) setUpdateError(null);

        const { name, value } = e.target;
        setUpdateSubscription({
            ...updateSubscription,
            [name]: value
        });
    };

    const handleOpenUpdateModal = (subscriptionToEdit: subscriptionItem) => {
        setCurrentEditingSubscription(subscriptionToEdit);
        setUpdateSubscription({
            subscriptionName: subscriptionToEdit.subscriptionName,
            price: subscriptionToEdit.price,
            timePeriod: subscriptionToEdit.timePeriod.toString(),
            numberOfServiceBoys: subscriptionToEdit.numberOfServiceBoys,
            benefits: subscriptionToEdit.benefits
        });
        setUpdateError(null);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setCurrentEditingSubscription(null);
        setUpdateSubscription({
            subscriptionName: '',
            price: '',
            timePeriod: '',
            numberOfServiceBoys: '',
            benefits: ''
        });
        setUpdateError(null);
    };

    const handleUpdateSubscription = async () => {
        // Form validation
        if (!updateSubscription.subscriptionName.trim() || !updateSubscription.numberOfServiceBoys || !updateSubscription.price.trim() || !updateSubscription.timePeriod || !updateSubscription.benefits.trim()) {
            toast.warning("All fields are required");
            setUpdateError("All fields are required");
            return;
        }

        if (!currentEditingSubscription) {
            setUpdateError("No subscription selected for update");
            return;
        }

        setIsUpdatingSubscription(true);
        setUpdateError(null);

        try {
            const res = await axiosClient.put(`/subscription/updatesubscription/${currentEditingSubscription.id}`, updateSubscription);

            if (res.status === 200) {
                toast.success("Subscription updated successfully");
                handleCloseUpdateModal();
                // Refresh the subscription list
                handleFetchSubscription();
            } else {
                setUpdateError("Unable to update the subscription");
                toast.error("Unable to update the subscription");
            }
        } catch (error: any) {
            console.error("Update subscription error:", error);
            const errorMessage = error.response?.data?.error || "Unable to update the subscription. Please try again.";
            setUpdateError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUpdatingSubscription(false);
        }
    };

    const handleAddSubscription = async () => {
        // Form validation
        if (!newSubscription.subscriptionName.trim() || !newSubscription.numberOfServiceBoys || !newSubscription.price.trim() || !newSubscription.timePeriod || !newSubscription.benefits.trim()) {
            toast.warning("All fields are required");
            setAddError("All fields are required");
            return;
        }

        setIsAddingSubscription(true);
        setAddError(null);

        try {
            const res = await axiosClient.post('/subscription/addsubscription', newSubscription);

            if (res.status === 201) {
                toast.success("Subscription added successfully");
                setNewSubscription({
                    subscriptionName: '',
                    price: '',
                    timePeriod: '',
                    numberOfServiceBoys: '',
                    benefits: ''
                });

                // Refresh the subscription list
                handleFetchSubscription();
            } else {
                setAddError("Unable to add the Subscription");
                toast.error("Unable to add the Subscription");
            }
        } catch (error: any) {
            console.error("Add subscription error:", error);
            const errorMessage = error.response?.data?.error || "Unable to add the subscription. Please try again.";
            setAddError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsAddingSubscription(false);
        }
    };

    const handleDeletesubscription = async (id: number) => {
        setDeletingsubscriptionIds(prev => [...prev, id]);

        try {
            const res = await axiosClient.delete(`/subscription/deletesubscription/${id}`);

            if (res.status === 200) {
                toast.success("subscription deleted successfully");
                handleFetchSubscription();
            } else {
                toast.error("Unable to delete subscription");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Unable to delete subscription. Please try again.";
            toast.error(errorMessage);
        } finally {
            // Remove the ID from the deleting array
            setDeletingsubscriptionIds(prev => prev.filter(deletingId => deletingId !== id));
        }
    };

    const handleFetchSubscription = async () => {
        setIsLoading(true);
        setFetchError(null);

        try {
            const res = await axiosClient.get('/subscription/getsubscription');

            if (res.status === 200) {
                setSubscription(res.data.subscriptions);
            } else {
                setFetchError("Unable to retrieve Subscription list");
                toast.error("Unable to get Subscription");
            }
        } catch (error: any) {
            console.error("Fetch subscriptions error:", error);
            const errorMessage = error.response?.data?.error || "Unable to load Subscription list. Please try again.";
            setFetchError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchSubscription();
    }, []);

    return (
        <div className="p-5 h-screen w-full">
            {/* Add New subscription Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <Plus size={18} className="mr-2" /> Add New Subscription
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
                            <Type size={16} className="mr-1" /> Subscription Name
                        </label>
                        <input
                            type="text"
                            name="subscriptionName"
                            value={newSubscription?.subscriptionName}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter subscription name"
                            disabled={isAddingSubscription}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <DollarSign size={16} className="mr-1" /> Price
                        </label>
                        <input
                            type="text"
                            name="price"
                            value={newSubscription?.price}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter price"
                            disabled={isAddingSubscription}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <Hash size={16} className="mr-1" /> Number of Service Boys
                        </label>
                        <input
                            type="number"
                            name="numberOfServiceBoys"
                            value={newSubscription?.numberOfServiceBoys}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter number of service boys"
                            disabled={isAddingSubscription}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <Layers size={16} className="mr-1" /> Months
                        </label>
                        <select
                            name="timePeriod"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={isAddingSubscription}
                            value={newSubscription.timePeriod}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Months</option>
                            {
                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((time) => (
                                    <option key={time} value={time}>{`${time} Months`}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                            <List size={16} className="mr-1" /> Benefits
                        </label>
                        <input
                            type="text"
                            name="benefits"
                            value={newSubscription.benefits}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter benefits separated by comma"
                            disabled={isAddingSubscription}
                        />
                    </div>
                </div>

                <div className="w-full flex justify-end">
                    <button
                        onClick={handleAddSubscription}
                        disabled={isAddingSubscription}
                        className={`mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center cursor-pointer font-medium ${isAddingSubscription ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isAddingSubscription ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" /> Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={16} className="mr-2 font-bold" /> Add Subscription
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Update Subscription Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                <Edit size={18} className="mr-2" /> Update Subscription
                            </h2>
                            <button
                                onClick={handleCloseUpdateModal}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={isUpdatingSubscription}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {updateError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                                <AlertTriangle size={18} className="mr-2" />
                                <span>{updateError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                    <Type size={16} className="mr-1" /> Subscription Name
                                </label>
                                <input
                                    type="text"
                                    name="subscriptionName"
                                    value={updateSubscription.subscriptionName}
                                    onChange={handleUpdateInputChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter subscription name"
                                    disabled={isUpdatingSubscription}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                    <DollarSign size={16} className="mr-1" /> Price
                                </label>
                                <input
                                    type="text"
                                    name="price"
                                    value={updateSubscription.price}
                                    onChange={handleUpdateInputChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter price"
                                    disabled={isUpdatingSubscription}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                    <Hash size={16} className="mr-1" /> Number of Service Boys
                                </label>
                                <input
                                    type="number"
                                    name="numberOfServiceBoys"
                                    value={updateSubscription.numberOfServiceBoys}
                                    onChange={handleUpdateInputChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter number of service boys"
                                    disabled={isUpdatingSubscription}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                    <Layers size={16} className="mr-1" /> Months
                                </label>
                                <select
                                    name="timePeriod"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled={isUpdatingSubscription}
                                    value={updateSubscription.timePeriod}
                                    onChange={handleUpdateInputChange}
                                >
                                    <option value="">Select Months</option>
                                    {
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((time) => (
                                            <option key={time} value={time}>{`${time} Months`}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
                                    <List size={16} className="mr-1" /> Benefits
                                </label>
                                <input
                                    type="text"
                                    name="benefits"
                                    value={updateSubscription.benefits}
                                    onChange={handleUpdateInputChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter benefits separated by comma"
                                    disabled={isUpdatingSubscription}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseUpdateModal}
                                disabled={isUpdatingSubscription}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubscription}
                                disabled={isUpdatingSubscription}
                                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center ${isUpdatingSubscription ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isUpdatingSubscription ? (
                                    <>
                                        <Loader size={16} className="mr-2 animate-spin" /> Updating...
                                    </>
                                ) : (
                                    <>
                                        <Edit size={16} className="mr-2" /> Update Subscription
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* subscription List Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Subscription List</h2>

                    <button
                        onClick={handleFetchSubscription}
                        disabled={isLoading}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                        title="Refresh subscription list"
                    >
                        <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-sm">Refresh</span>
                    </button>
                </div>

                {/* Error state for subscription list */}
                {fetchError && !isLoading && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
                        <div className="flex items-center text-red-700">
                            <AlertTriangle size={18} className="mr-2" />
                            <span>{fetchError}</span>
                        </div>
                        <button
                            onClick={handleFetchSubscription}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center text-sm"
                        >
                            <RefreshCw size={14} className="mr-1" /> Try Again
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader size={30} className="text-blue-500 animate-spin mb-3" />
                        <p className="text-gray-500">Loading subscriptions...</p>
                    </div>
                )}

                {/* subscriptions Table - Only show when not loading and no error */}
                {!isLoading && !fetchError && (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-xl overflow-hidden">
                            <thead className="bg-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Subscription Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Time Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Number Of Service Boy
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Benefits
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscription.length > 0 ? (
                                    subscription.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {subscription.subscriptionName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {subscription.timePeriod} {subscription.timePeriod == 1 ? 'Month' : 'Months'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${subscription.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {subscription.numberOfServiceBoys}
                                            </td>
                                            <th className="px-6 py-4 text-sm text-gray-900 text-left align-top">
                                                {
                                                    subscription.benefits.split(',').map((be, index) => (
                                                        <p
                                                            key={index}
                                                            className="text-gray-900 font-medium truncate max-w-[200px] overflow-hidden whitespace-nowrap"
                                                            title={be.trim()} // Optional: show full benefit on hover
                                                        >
                                                            • {be.trim()}
                                                        </p>
                                                    ))
                                                }
                                            </th>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenUpdateModal(subscription)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                                                        title="Edit subscription"
                                                        disabled={isUpdateModalOpen}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletesubscription(subscription.id)}
                                                        disabled={deletingsubscriptionIds.includes(subscription.id)}
                                                        className={`text-red-500 hover:text-red-700 transition-colors ${deletingsubscriptionIds.includes(subscription.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        title="Delete subscription"
                                                    >
                                                        {deletingsubscriptionIds.includes(subscription.id) ? (
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
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No subscriptions found matching your search
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty state - Only show when not loading, no error, and no subscriptions */}
                {!isLoading && !fetchError && subscription.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                        <DollarSign size={40} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-1">No subscriptions found</p>
                        <p className="text-gray-400 text-sm">Add a new subscription to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}