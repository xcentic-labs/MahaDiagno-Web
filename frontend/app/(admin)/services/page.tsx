"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Plus, FileText, Image, Upload, Loader2, AlertCircle } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define TypeScript interfaces
interface ServiceItem {
  id: number;
  title: string;
  price: string;
  banner: string;
  banner_url: string;
}

interface NewServiceForm {
  title: string;
  price: string;
  imageFile: File | null;
}

export default function Services() {
  // State management
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newService, setNewService] = useState<NewServiceForm>({
    title: '',
    price: '',
    imageFile: null
  });
  
  // Handle input changes for text fields
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };
  
  // Handle file input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewService({
        ...newService,
        imageFile: file
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!newService.title.trim()) {
      toast.warning("Service title is required");
      return false;
    }
    
    if (!newService.price.trim()) {
      toast.warning("Service price is required");
      return false;
    }
    
    if (isNaN(Number(newService.price))) {
      toast.warning("Price must be a valid number");
      return false;
    }
    
    if (!newService.imageFile) {
      toast.warning("Banner image is required");
      return false;
    }
    
    return true;
  };
  
  // Add new service
  const handleAddService = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newService.title);
      formData.append('price', newService.price);
      
      if (newService.imageFile) {
        formData.append('banner', newService.imageFile);
      }
      
      const res = await axiosClient.post('/service/addservice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.status === 201) {
        toast.success("Service added successfully");
        fetchServices();
        resetForm();
      } else {
        throw new Error("Failed to add service");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to add service. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a service
  const handleDeleteService = async (id: number): Promise<void> => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const res = await axiosClient.delete(`/service/deleteservice/${id}`);
      
      if (res.status === 200 || res.status === 201) {
        toast.success("Service deleted successfully");
        setServices(services.filter(service => service.id !== id));
      } else {
        throw new Error("Failed to delete service");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to delete service. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Fetch all services
  const fetchServices = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axiosClient.get('/service/getservices');
      
      if (res.status === 200) {
        setServices(res.data.services || []);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to fetch services. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form after submission
  const resetForm = (): void => {
    setNewService({
      title: '',
      price: '',
      imageFile: null
    });
    
    // Reset file input
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // UI Components for different states
  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-red-600">Error Loading Services</h3>
      <p className="mt-2 text-gray-600">{error}</p>
      <button 
        onClick={fetchServices}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600">Loading services...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <Image size={40} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">No Services Found</h3>
      <p className="mt-2 text-gray-500">Add your first service using the form above.</p>
    </div>
  );
  
  return (
    <div className="p-5 min-h-screen bg-gray-50">
      {/* Add New Service Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <Plus size={18} className="mr-2" /> Add New Service
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <FileText size={16} className="mr-1" /> Service Title
            </label>
            <input
              type="text"
              name="title"
              value={newService.title}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter service title"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              ₹ Service Price
            </label>
            <input
              type="text"
              name="price"
              value={newService.price}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter service price"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
              <Upload size={16} className="mr-1" /> Banner Image
            </label>
            <div className="flex items-center">
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isSubmitting}
              />
            </div>
            {newService.imageFile && (
              <p className="mt-1 text-xs text-gray-500">Selected: {newService.imageFile.name}</p>
            )}
          </div>
        </div>
        
        <div className="w-full flex justify-end">
          <button
            onClick={handleAddService}
            disabled={isSubmitting}
            className={`mt-4 ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md transition-colors flex items-center font-medium`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" /> Add Service
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Service List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Services List</h2>
        
        {error && renderErrorState()}
        
        {!error && isLoading && renderLoadingState()}
        
        {!error && !isLoading && services.length === 0 && renderEmptyState()}
        
        {!error && !isLoading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 relative">
                  {service.banner_url ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/servicebanner/${service.banner_url}`} 
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Image size={32} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2">
                    {service.banner}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{service.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-blue-600 font-medium">₹{service.price}</p>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      disabled={isDeleting === service.id}
                      className={`text-red-500 hover:text-red-700 transition-colors ${isDeleting === service.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      aria-label="Delete service"
                    >
                      {isDeleting === service.id ? (
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