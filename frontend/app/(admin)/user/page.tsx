"use client"
import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, RefreshCw } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define TypeScript interface for User
interface User {
  id: number;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  totalAppointments: number | null;
}

export default function UsersTable() {
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const redirect = useRouter()

  // Handle delete user
  const handleDeleteUser = async (id: number) => {
    try {
      setDeletingUserId(id);
      const res = await axiosClient.delete(`/user/deleteuser/${id}`);

      if (res.status === 200) {
        toast.success("User deleted successfully");
        // Update the users state by removing the deleted user
        setUsers(users.filter(user => user.id !== id));
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while trying to delete the user");
    } finally {
      setDeletingUserId(null);
    }
  };

  // Handle view user details
  const handleViewUser = (id: number): void => {
    redirect.push(`/user/${id}`);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    (user.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.phoneNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/user/getalluser');

      if (res.status === 200) {
        setUsers(res.data.userData);
      } else {
        setError("Failed to load users data");
        toast.error("Unable to load users data");
      }
    } catch (error) {
      setError("An error occurred while fetching users");
      toast.error("Unable to load users data");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Users List</h2>
          <button
            onClick={handleRetry}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || error !== null}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
            <p className="text-gray-600 mt-2">Loading users data...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Users Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Total Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phoneNumber ? `+91 ${user.phoneNumber}` : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.firstName || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastName || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalAppointments !== null ? user.totalAppointments : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View User"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${deletingUserId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            title="Delete User"
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full"></div>
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
                      No users found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && users.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No users available</p>
          </div>
        )}
      </div>
    </div>
  );
}