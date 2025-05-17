"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, User, Mail, Lock, Search, Eye, EyeOff, Loader, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { axiosClient } from '@/lib/axiosClient';

// Define TypeScript interfaces
interface AdminItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface NewAdminForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function AdminManagement() {
  // Admin data states
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [newAdmin, setNewAdmin] = useState<NewAdminForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState<boolean>(false);
  const [deletingAdminIds, setDeletingAdminIds] = useState<number[]>([]);

  // Error states
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Clear any add errors when user starts typing
    if (addError) setAddError(null);

    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleAddAdmin = async () => {
    // Form validation
    if (!newAdmin.firstName.trim() || !newAdmin.lastName.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      toast.warning("All fields are required");
      setAddError("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdmin.email)) {
      toast.warning("Please enter a valid email address");
      setAddError("Please enter a valid email address");
      return;
    }

    setIsAddingAdmin(true);
    setAddError(null);

    try {
      const res = await axiosClient.post('/admin/addadmin', newAdmin);

      if (res.status === 201) {
        toast.success("Admin added successfully");
        setNewAdmin({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        });

        // Refresh the admin list
        handleFetchAdmins();
      } else {
        setAddError("Unable to add the admin");
        toast.error("Unable to add the admin");
      }
    } catch (error: any) {
      console.error("Add admin error:", error);
      const errorMessage = error.response?.data?.error || "Unable to add the admin. Please try again.";
      setAddError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    // Add the ID to the deleting array
    setDeletingAdminIds(prev => [...prev, id]);

    try {
      const res = await axiosClient.delete(`/admin/deleteadmin/${id}`);

      if (res.status === 200) {
        toast.success("Admin deleted successfully");
        // Remove the admin from the local state
        setAdmins(prev => prev.filter(admin => admin.id !== id));
      } else {
        toast.error("Unable to delete admin");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to delete admin. Please try again.";
      toast.error(errorMessage);
    } finally {
      // Remove the ID from the deleting array
      setDeletingAdminIds(prev => prev.filter(id => id !== id));
    }
  };

  const handleFetchAdmins = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const res = await axiosClient.get('/admin/getadmins');

      if (res.status === 200) {
        setAdmins(res.data.admins);
      } else {
        setFetchError("Unable to retrieve admin list");
        toast.error("Unable to get admins");
      }
    } catch (error: any) {
      console.error("Fetch admins error:", error);
      const errorMessage = error.response?.data?.error || "Unable to load admin list. Please try again.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAdmins();
  }, []);

  // Filter admins based on search query
  const filteredAdmins = admins?.filter(admin =>
    admin?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin?.lastName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    admin?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="p-5 h-screen">
      {/* Add New Admin Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <Plus size={18} className="mr-2" /> Add New Admin
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
              value={newAdmin.firstName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter first name"
              disabled={isAddingAdmin}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <User size={16} className="mr-1" /> Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={newAdmin.lastName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter last name"
              disabled={isAddingAdmin}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <Mail size={16} className="mr-1" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter email address"
              disabled={isAddingAdmin}
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
                value={newAdmin.password}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter password"
                disabled={isAddingAdmin}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={isAddingAdmin}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={handleAddAdmin}
            disabled={isAddingAdmin}
            className={`mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center cursor-pointer font-medium ${isAddingAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAddingAdmin ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2 font-bold" /> Add Admin
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Admins List</h2>

          <button
            onClick={handleFetchAdmins}
            disabled={isLoading}
            className="flex items-center text-blue-600 hover:text-blue-800"
            title="Refresh admin list"
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Error state for admin list */}
        {fetchError && !isLoading && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
            <div className="flex items-center text-red-700">
              <AlertTriangle size={18} className="mr-2" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={handleFetchAdmins}
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
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || !!fetchError}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader size={30} className="text-blue-500 animate-spin mb-3" />
            <p className="text-gray-500">Loading admins...</p>
          </div>
        )}

        {/* Admins Table - Only show when not loading and no error */}
        {!isLoading && !fetchError && (
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={deletingAdminIds.includes(admin.id)}
                          className={`text-red-500 hover:text-red-700 transition-colors ${deletingAdminIds.includes(admin.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title="Delete Admin"
                        >
                          {deletingAdminIds.includes(admin.id) ? (
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
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No admins found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state - Only show when not loading, no error, and no admins */}
        {!isLoading && !fetchError && admins.length === 0 && (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
            <User size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-1">No admins found</p>
            <p className="text-gray-400 text-sm">Add a new admin to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}