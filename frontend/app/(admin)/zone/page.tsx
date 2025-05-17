"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define TypeScript interfaces
interface ZoneItem {
  id: number;
  state: string;
  district: string;
  pincode: string;
}

interface NewZoneForm {
  state: string;
  district: string;
  pincode: string;
}

export default function Zone() {
  // State management
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newZone, setNewZone] = useState<NewZoneForm>({
    state: '',
    district: '',
    pincode: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewZone({
      ...newZone,
      [name]: value
    });
  };

  const validateForm = (): boolean => {
    if (!newZone.state.trim()) {
      toast.warning("State field is required");
      return false;
    }
    if (!newZone.district.trim()) {
      toast.warning("District field is required");
      return false;
    }
    if (!newZone.pincode.trim()) {
      toast.warning("Pincode field is required");
      return false;
    }
    if (!/^\d{6}$/.test(newZone.pincode)) {
      toast.warning("Pincode must be exactly 6 digits");
      return false;
    }
    return true;
  };

  const handleAddZone = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newZoneItem: NewZoneForm = {
        state: newZone.state,
        district: newZone.district,
        pincode: newZone.pincode
      };
      
      const res = await axiosClient.post('/zone/addzone', newZoneItem);

      if (res.status === 201) {
        toast.success("Zone added successfully");
        setNewZone({ state: '', district: '', pincode: '' });
        fetchZones();
      } else {
        throw new Error("Failed to add zone");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to add zone. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async (id: number) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const res = await axiosClient.delete(`/zone/deletezone/${id}`);

      if (res.status === 200) {
        toast.success("Zone deleted successfully");
        setZones(zones.filter(zone => zone.id !== id));
      } else {
        throw new Error("Failed to delete zone");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to delete zone. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axiosClient.get('/zone/getzones');

      if (res.status === 200) {
        console.log(res.data.ZoneData);
        setZones(res.data.ZoneData || []);
      } else {
        throw new Error("Failed to fetch zones");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to fetch zones. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch zones on component mount
  useEffect(() => {
    fetchZones();
  }, []);

  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-red-600">Error Loading Zones</h3>
      <p className="mt-2 text-gray-600">{error}</p>
      <button 
        onClick={fetchZones}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600">Loading zones...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <MapPin size={40} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">No Zones Found</h3>
      <p className="mt-2 text-gray-500">Add your first zone using the form above.</p>
    </div>
  );

  return (
    <div className="p-5 min-h-screen bg-gray-50">
      {/* Add New Zone Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <Plus size={18} className="mr-2" /> Add New Zone
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <MapPin size={16} className="mr-1" /> State
            </label>
            <input
              type="text"
              name="state"
              value={newZone.state}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter state name"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <MapPin size={16} className="mr-1" /> District
            </label>
            <input
              type="text"
              name="district"
              value={newZone.district}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter district name"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <MapPin size={16} className="mr-1" /> Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={newZone.pincode}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              disabled={isSubmitting}
              pattern="\d{6}"
            />
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={handleAddZone}
            disabled={isSubmitting}
            className={`mt-4 ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md transition-colors flex items-center font-medium`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" /> Add Zone
              </>
            )}
          </button>
        </div>
      </div>

      {/* Zone List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Zones List</h2>

        {error && renderErrorState()}
        
        {!error && isLoading && renderLoadingState()}
        
        {!error && !isLoading && zones.length === 0 && renderEmptyState()}

        {!error && !isLoading && zones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{zone.district}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Pincode: {zone.pincode}</p>
                    <p>State: {zone.state}</p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      disabled={isDeleting === zone.id}
                      className={`text-red-500 hover:text-red-700 transition-colors ${isDeleting === zone.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      aria-label="Delete zone"
                    >
                      {isDeleting === zone.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}