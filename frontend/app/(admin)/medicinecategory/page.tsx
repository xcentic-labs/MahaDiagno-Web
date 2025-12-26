"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Eye, Edit, Image as ImageIcon, Search, RefreshCw, X } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { MedicineCategory, MedicineCategoryResponse } from "@/lib/types";
import { toast } from "react-toastify";

export default function MedicineCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    medicineCategory: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch all medicine categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<MedicineCategoryResponse>("/pharmacy/medicinecategory/getmedicinecategories");
      if (response.status === 200 && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch medicine categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, medicineCategory: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new medicine category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.medicineCategory) {
      toast.error("Please fill in all fields and select an image");
      return;
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("medicineCategory", formData.medicineCategory);
      formDataToSend.append("name", formData.name);

      const response = await axiosClient.post("/pharmacy/medicinecategory/addmedicinecategory", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status == 201) {
        toast.success("Medicine category added successfully");
        setFormData({ name: "", medicineCategory: null });
        setImagePreview(null);
        setShowAddForm(false);
        fetchCategories(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add medicine category");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete medicine category
  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine category?")) {
      return;
    }

    try {
      setDeletingCategoryId(id);
      const response = await axiosClient.delete(`/pharmacy/medicinecategory/deactivatemedicinecategory/${id}`);
      if (response.status === 200) {
        toast.success("Medicine category deleted successfully");
        setCategories(categories.filter(cat => cat.id !== id));
      }
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete medicine category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Navigate to view/edit page
  const handleViewCategory = (id: number) => {
    router.push(`/medicinecategory/${id}`);
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Retry fetching data
  const handleRetry = () => {
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-5 h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Medicine Categories</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </button>
            <button
              onClick={handleRetry}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent mb-2"></div>
            <p className="text-gray-600 mt-2">Loading categories...</p>
          </div>
        )}

        {/* Categories Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
              <thead className="bg-gray-300 border-b rounded-t-xl">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-right pr-5 text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.imageUrl ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${category.imageUrl}`}
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 justify-end flex">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewCategory(category.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="View/Edit Category"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingCategoryId === category.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete Category"
                            disabled={deletingCategoryId === category.id}
                          >
                            {deletingCategoryId === category.id ? (
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
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">No medicine categories available</p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Medicine Category</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Pain Relief, Antibiotics"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: "", medicineCategory: null });
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}