"use client"
import { useEffect, useState } from 'react';
import { Eye, Trash2, Search, RefreshCw, Plus, X } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define TypeScript interface for Partner
interface Partner {
  id: number;
  hospitalName: string | null;
  phoneNumber: string | null;
  email: string | null;
  isSubscribed: boolean;
  _count: {
    subscription_purchase: number;
    serviceBoy: number;
    appointment: number;
    services: number;
  };
}

// Define interfaces for Address and Zone
interface Address {
  area: string;
  district: string;
  landmark: string;
  pincode: string;
  state: string;
}

interface Zone {
  id: number;
  name: string;
  pincode: string;
  district: string;
  state: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

export default function Partner() {
  // States
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState<number | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  
  // Form states
  const [hospitalName, setHospitalName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Address and Zone states
  const [address, setAddress] = useState<Address>({
    area: '',
    district: '',
    landmark: '',
    pincode: '',
    state: ''
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    latitude: 0,
    longitude: 0
  });
  
  const redirect = useRouter();

  // Handle add address
  const handleAddAddress = async () => {
    console.log(address);

    if (!address.area || !address.district || !address.landmark || !address.pincode || !address.state) {
      toast.error("All Address Fields Are Required");
      return;
    }

    if (!hospitalName || !email || !phoneNumber || !password) {
      toast.error("All Partner Fields Are Required");
      return;
    }

    if (!selectedZone) {
      toast.error("Please select a zone");
      return;
    }

    setIsButtonLoading(true);

    const addressData = {
      ...address,
      lat: selectedLocation.latitude.toFixed(4),
      lng: selectedLocation.longitude.toFixed(4),
    };

    try {
      const addressRes = await axiosClient.post('/address/addaddress', addressData);

      if (addressRes.status === 201) {
        // Create partner account
        const partnerData = {
          hospitalName,
          email,
          phoneNumber,
          password,
          addressId: addressRes.data.address.id,
          zoneId: selectedZone
        };

        const partnerRes = await axiosClient.post('/partners/createaccount', partnerData);

        if (partnerRes.status === 201) {
          toast.success("Partner Added Successfully");
          
          // Reset form
          setHospitalName('');
          setEmail('');
          setPhoneNumber('');
          setPassword('');
          setAddress({
            area: '',
            district: '',
            landmark: '',
            pincode: '',
            state: ''
          });
          setSelectedZone(null);
          setSelectedLocation({ latitude: 0, longitude: 0 });
          setIsModalOpen(false);
          
          // Refresh partners list
          fetchPartners();
        } else {
          toast.error("Unable To Add Partner");
        }
      } else {
        toast.error("Unable To Add Address");
      }
    } catch (error) {
      console.warn(error);
      toast.error("Unable To Add Partner");
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Fetch zones
  const fetchZones = async () => {
    try {
      const res = await axiosClient.get('/zone/getzones');

      if (res.status === 200) {
        console.log(res.data);
        setZones(res.data.ZoneData);
      } else {
        toast.error("Unable To get Zones");
      }
    } catch (error) {
      toast.error("Unable To get Zones");
    }
  };

  // Handle zone selection and auto-populate district, pincode, state
  const handlesetStates = (value: number | null) => {
    const data = zones?.filter((zone) => {
      return zone?.id === value;
    });

    console.log(data);

    if (!value) {
      setSelectedZone(null);
      setAddress({
        ...address,
        pincode: "",
        state: "",
        district: ""
      });
    } else {
      console.log(value);
      setSelectedZone(value);
      setAddress({ 
        ...address, 
        pincode: data[0]?.pincode, 
        state: data[0]?.state, 
        district: data[0]?.district 
      });
    }
  };

  // Handle delete partner
  const handleDeletePartner = async (id: number) => {
    try {
      setDeletingPartnerId(id);
      const res = await axiosClient.delete(`/partners/deletepartners/${id}`);

      if (res.status === 200) {
        toast.success("Partner deleted successfully");
        // Update the partners state by removing the deleted partner
        setPartners(partners.filter(partner => partner.id !== id));
      } else {
        toast.error("Failed to delete partner");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("An error occurred while trying to delete the partner");
    } finally {
      setDeletingPartnerId(null);
    }
  };

  // Handle view partner details
  const handleViewPartner = (id: number): void => {
    redirect.push(`/partner/${id}`);
  };

  // Filter partners based on search query
  const filteredPartners = partners.filter(partner =>
    (partner.hospitalName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (partner.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (partner.phoneNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await axiosClient.get('/partners/getallpartners');

      if (res.status === 200) {
        console.log(res.data.partners);
        setPartners(res.data.partners);
      } else {
        setError("Failed to load partners data");
        toast.error("Unable to load partners data");
      }
    } catch (error) {
      setError("An error occurred while fetching partners");
      toast.error("Unable to load partners data");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching data
  const handleRetry = () => {
    fetchPartners();
  };

  useEffect(() => {
    fetchPartners();
    fetchZones();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Partner List</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Partner
            </button>
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
              placeholder="Search partners..."
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
            <p className="text-gray-600 mt-2">Loading partners data...</p>
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

        {/* Partners Table - Show only when not loading and no errors */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Hospital Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Subscription Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Total Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Service Boys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.hospitalName || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.phoneNumber ? `+91 ${partner.phoneNumber}` : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner.email || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.isSubscribed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {partner.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.appointment || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.serviceBoy || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {partner._count.services || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewPartner(partner.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View Partner"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingPartnerId === partner.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete Partner"
                            disabled={deletingPartnerId === partner.id}
                          >
                            {deletingPartnerId === partner.id ? (
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
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No partners found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - When no data and not loading */}
        {!isLoading && !error && partners.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No partners available</p>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Partner</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Partner Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter hospital name"
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
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              {/* Address Details */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area *
                    </label>
                    <input
                      type="text"
                      value={address.area}
                      onChange={(e) => setAddress({ ...address, area: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark *
                    </label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter landmark"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District/Town/City *
                    </label>
                    <select
                      value={selectedZone || ''}
                      onChange={(e) => handlesetStates(Number(e.target.value) || null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select a district</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={address.pincode}
                      readOnly
                      className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Pincode will be auto-filled"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={address.state}
                      readOnly
                      className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="State will be auto-filled"
                    />
                  </div>
                </div>

                {/* Location Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={selectedLocation.latitude}
                      onChange={(e) => setSelectedLocation({ ...selectedLocation, latitude: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter latitude"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={selectedLocation.longitude}
                      onChange={(e) => setSelectedLocation({ ...selectedLocation, longitude: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>

                <label className="block text-sm text-red-600 mt-4">
                  *You can get latitude and longitude from Google Maps <br />
                  (Right-click on the location in Google Maps and select the latitude and longitude)  
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isButtonLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={isButtonLoading}
                  className={`px-4 py
                    -2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    isButtonLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isButtonLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Partner'
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