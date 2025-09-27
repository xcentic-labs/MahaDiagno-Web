"use client"
import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, RefreshCw, Plus, X } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define TypeScript interface for Specialization
interface Specialization {
  id: number;
  key: string;
  label: string;
  imageUrl?: string;
}

// Define TypeScript interface for Doctor
interface Doctor {
  id: number;
  displayName: string;
  phoneNumber: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  lat: string;
  lng: string;
  imageUrl: string | null;
  specialization: Specialization;
  startingFee: number;
  totalExperience: number;
}

export default function Doctors() {
  // States
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  
  // Form states
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [clinicName, setClinicName] = useState<string>('');
  const [clinicAddress, setClinicAddress] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [startingFee, setStartingFee] = useState<number>(0);
  const [totalExperience, setTotalExperience] = useState<number>(0);
  const [specializationId, setSpecializationId] = useState<number | null>(null);
  
  // Available specializations - fetched from API
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  
  const router = useRouter();

  // Handle add doctor
  const handleAddDoctor = async () => {
    if (!displayName || !email || !phoneNumber || !clinicName || !clinicAddress || !lat || !lng || !specializationId) {
      toast.error("All fields are required");
      return;
    }

    if (startingFee < 0 || totalExperience < 0) {
      toast.error("Fee and experience cannot be negative");
      return;
    }

    setIsButtonLoading(true);

    const doctorData = {
      displayName,
      email,
      phoneNumber,
      clinicName,
      clinicAddress,
      lat,
      lng,
      startingFee,
      totalExperience,
      specializationId
    };

    try {
      const res = await axiosClient.post('/doctor/create', doctorData);

      if (res.status === 201) {
        toast.success("Doctor Added Successfully");
        
        // Reset form
        resetForm();
        setIsModalOpen(false);
        
        // Refresh doctors list
        fetchDoctors();
      } else {
        toast.error("Unable To Add Doctor");
      }
    } catch (error) {
      console.warn(error);
      toast.error("Unable To Add Doctor");
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Fetch specializations
  const fetchSpecializations = async () => {
    try {
      const res = await axiosClient.get('/specialization/getall');

      if (res.status === 200 && res.data.success) {
        setSpecializations(res.data.specializations);
      } else {
        toast.error("Unable to fetch specializations");
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Unable to fetch specializations");
    }
  };
  const resetForm = () => {
    setDisplayName('');
    setEmail('');
    setPhoneNumber('');
    setClinicName('');
    setClinicAddress('');
    setLat('');
    setLng('');
    setStartingFee(0);
    setTotalExperience(0);
    setSpecializationId(null);
  };

  // Handle delete doctor
  const handleDeleteDoctor = async (id: number) => {
    try {
      setDeletingDoctorId(id);
      const res = await axiosClient.delete(`/doctor/delete/${id}`);

      if (res.status === 200) {
        toast.success("Doctor deleted successfully");
        // Update the doctors state by removing the deleted doctor
        setDoctors(doctors.filter(doctor => doctor.id !== id));
      } else {
        toast.error("Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("An error occurred while trying to delete the doctor");
    } finally {
      setDeletingDoctorId(null);
    }
  };

  // Handle view doctor details
  const handleViewDoctor = (id: number): void => {
    router.push(`/doctor/${id}`);
  };

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor =>
    doctor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/doctor/getall');

      if (res.status === 200) {
        console.log(res.data);
        setDoctors(res.data);
      } else {
        setError("Failed to load doctors data");
        toast.error("Unable to load doctors data");
      }
    } catch (error) {
      setError("An error occurred while fetching doctors");
      toast.error("Unable to load doctors data");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchDoctors();
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Doctors List</h2>
          <div className="flex space-x-3">
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Doctor
            </button> */}
            <button
              onClick={handleRetry}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
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
            <p className="text-gray-600 mt-2">Loading doctors data...</p>
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

        {/* Doctors Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Doctor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Clinic Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Starting Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {doctor.imageUrl && (
                            <img
                              src={`https://api.mahadiagno.com/${doctor.imageUrl}`}
                              alt={doctor.displayName}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{doctor.displayName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +91 {doctor.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.clinicName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {doctor.specialization.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{doctor.startingFee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.totalExperience} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap justify-center text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewDoctor(doctor.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Doctor"
                          >
                            <Eye size={18} />
                          </button>
                          {/* <button
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingDoctorId === doctor.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete Doctor"
                            disabled={deletingDoctorId === doctor.id}
                          >
                            {deletingDoctorId === doctor.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No doctors found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && doctors.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No doctors available</p>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Doctor</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Doctor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter doctor name (e.g., Dr. John Doe)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter clinic name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    value={specializationId || ''}
                    onChange={(e) => setSpecializationId(Number(e.target.value) || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={startingFee}
                    onChange={(e) => setStartingFee(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter consultation fee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter years of experience"
                  />
                </div>
              </div>

              {/* Clinic Address and Location */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Clinic Location</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clinic Address *
                    </label>
                    <textarea
                      rows={3}
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter complete clinic address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter latitude (e.g., 28.764513)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                      </label>
                      <input
                        type="text"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter longitude (e.g., 77.206889)"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-red-600">
                    *You can get latitude and longitude from Google Maps <br />
                    (Right-click on the location in Google Maps and select the coordinates)  
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isButtonLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDoctor}
                  disabled={isButtonLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    isButtonLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isButtonLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Doctor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}