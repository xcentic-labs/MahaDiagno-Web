'use client';

import { useEffect, useState } from 'react';
import { redirect, useParams } from 'next/navigation';
import { axiosClient } from '@/lib/axiosClient';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  patientAge: string;
  gender: string;
  referringDoctor: string;
  additionalPhoneNumber: string;
  status: 'ACCEPTED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
}

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  appointments: Appointment[];
}

interface ApiResponse {
  message: string;
  userData: UserData;
}

const statusColors = {
  ACCEPTED: 'text-green-600',
  CANCELLED: 'text-red-600',
  COMPLETED: 'text-blue-600',
  SCHEDULED: 'text-yellow-600'
};

export default function UserDetail() {
  const { id } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const redirect = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get<ApiResponse>(`/user/getuser/${id}`);
        setUserData(response.data.userData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-8">
        <div className="p-4 border border-red-300 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-8">
        <div className="p-4 border border-yellow-300 rounded-md">
          <p className="text-yellow-600">No user found with the specified ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto">
      
      {/* User Info Card */}
      <div className="mb-8 border rounded-md shadow-sm">
        <div className="bg-gray-100 px-6 py-3 border-b">
          <h2 className="text-lg font-medium text-gray-700">User Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <div className="text-gray-700">{userData?.firstName}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <div className="text-gray-700">{userData?.lastName}</div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="text-gray-700">{userData?.email}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
              <div className="text-gray-700">+91 {userData?.phoneNumber}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
              <div className="text-gray-700">{userData?.id}</div>
            </div>
          </div>
          <div className="flex justify-center md:justify-end items-start">
            <div className="bg-gray-100 border rounded-full h-24 w-24 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-500">
                {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="border rounded-md shadow-sm">
        <div className="flex justify-between items-center bg-gray-100 px-6 py-3 border-b">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-700">Appointments</h2>
          </div>
          <div>
            <span className="px-2 py-1 text-sm bg-gray-200 rounded-md text-gray-700">
              Total: {userData?.appointments.length}
            </span>
          </div>
        </div>
        
        {/* Search Bar */}
      
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referring Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData?.appointments.length > 0 ? (
                userData?.appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment?.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {appointment?.patientFirstName} {appointment?.patientLastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment?.patientAge} / {appointment?.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment?.referringDoctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment?.additionalPhoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={statusColors[appointment?.status]}>
                        {appointment?.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-500 hover:text-blue-700 cursor-pointer" onClick={()=> redirect.push(`/appointment/${appointment?.id}`)}>
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No appointments found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}