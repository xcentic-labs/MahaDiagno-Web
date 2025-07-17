"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Trash2, Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { axiosClient } from '@/lib/axiosClient';
import { toast } from 'react-toastify';

// Define TypeScript interfaces
interface BannerItem {
  id: number;
  imageName: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function BannerUpload() {
  // State management
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(()=>{
    console.log("error : " + error)
  },[error])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.warning("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.warning("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBanner = async () => {
    if (!selectedFile) {
      toast.warning("Please select an image file");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const res = await axiosClient.post('/banner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Banner uploaded successfully");
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reset file input
        const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchBanners();
      } else {
        throw new Error("Failed to upload banner");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to upload banner. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const res = await axiosClient.delete(`/banner/delete/${id}`);

      if (res.status === 200) {
        toast.success("Banner deleted successfully");
        setBanners(banners.filter(banner => banner.id !== id));
      } else {
        throw new Error("Failed to delete banner");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to delete banner. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axiosClient.get('/banner/get');

      if (res.status === 200) {
        console.log(res.data);
        setBanners(res.data.data || res.data || []);
      } else {
        throw new Error("Failed to fetch banners");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Unable to fetch banners. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const renderErrorState = () => (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-red-600">Error Loading Banners</h3>
      <p className="mt-2 text-gray-600">{error}</p>
      <button 
        onClick={fetchBanners}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600">Loading banners...</p>
    </div>
  );

  const renderEmptyState = () => (

    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <ImageIcon size={40} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">No Banners Found</h3>
      <p className="mt-2 text-gray-500">Upload your first banner using the form above.</p>
    </div>
  );

  return (
    <div className="p-5 min-h-screen bg-gray-50">
      {/* Upload Banner Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <Upload size={18} className="mr-2" /> Upload New Banner
        </h2>

        <div className="space-y-4">
          {/* File Upload Input */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2 flex items-center">
              <ImageIcon size={16} className="mr-1" /> Select Banner Image
            </label>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md"
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB , 1080 × 600px recommended.
            </p>
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
              <div className="relative inline-block">
                <img 
                  src={previewUrl} 
                  alt="Banner preview" 
                  className="max-w-full max-h-48 rounded-md border"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={isUploading}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-2">
            {selectedFile && (
              <button
                onClick={clearSelection}
                disabled={isUploading}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleUploadBanner}
              disabled={isUploading || !selectedFile}
              className={`${
                isUploading || !selectedFile 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded-md transition-colors flex items-center font-medium`}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" /> Upload Banner
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Banner List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Uploaded Banners</h2>

        {error && renderErrorState()}
        
        {!error && isLoading && renderLoadingState()}
        
        {!error && !isLoading && banners.length === 0 && renderEmptyState()}

        {!error && !isLoading && banners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/banner/${banner.imageName}`} 
                    alt={`Banner ${banner.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-banner.jpg'; // Fallback image
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">Banner #{banner.id}</h3>
                      {banner.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {new Date(banner.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      disabled={isDeleting === banner.id}
                      className={`text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 ${
                        isDeleting === banner.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      aria-label="Delete banner"
                    >
                      {isDeleting === banner.id ? (
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