"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Edit, X } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { toast } from "react-toastify";

interface MedicineSubCategory {
  id: number;
  name: string;
}

export default function MedicineCategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("");
  
  // Subcategories state
  const [subCategories, setSubCategories] = useState<MedicineSubCategory[]>([]);
  const [showAddSubCategoryForm, setShowAddSubCategoryForm] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newSubCategoryImage, setNewSubCategoryImage] = useState<File | null>(null);
  const [subCategoryImagePreview, setSubCategoryImagePreview] = useState<string | null>(null);
  const [submittingSubCategory, setSubmittingSubCategory] = useState(false);
  const [deletingSubCategoryId, setDeletingSubCategoryId] = useState<number | null>(null);
  
 

  // Edit subcategory state
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<number | null>(null);
  const [editingSubCategoryName, setEditingSubCategoryName] = useState("");

  // Fetch medicine category details
  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/pharmacy/medicinecategory/getmedicinecategory/${id}`);
      if (response.status === 200 || response.data.success) {
        const category = response.data.data;
        setCategoryName(category.name);
        setOriginalName(category.name);
        setCategoryImage(category.imageUrl);
        if (category.medicineSubCategory) {
          setSubCategories(category.medicineSubCategory);
        }
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to fetch category details");
    } finally {
      setLoading(false);
    }
  };

  // Update medicine category name (only name, no image)
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axiosClient.put(`/pharmacy/medicinecategory/updatemedicinecategory/${id}`, {
        name: categoryName
      });

      if (response.data.success || response.status === 200) {
        toast.success("Medicine category updated successfully");
        setIsEditing(false);
        setOriginalName(categoryName);
        fetchCategoryDetails();
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update medicine category");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle subcategory image selection
  const handleSubCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSubCategoryImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSubCategoryImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add subcategory
  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubCategoryName.trim()) {
      toast.error("Please enter a subcategory name");
      return;
    }

    if (!newSubCategoryImage) {
      toast.error("Please select a subcategory image");
      return;
    }

    try {
      setSubmittingSubCategory(true);
      
      const formData = new FormData();
      formData.append("name", newSubCategoryName);
      formData.append("medicineCategoryId", id);
      formData.append("medicineSubCategory", newSubCategoryImage);

      const response = await axiosClient.post('/pharmacy/medicinecategory/addmedicinesubcategory', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success || response.status === 201) {
        toast.success("Subcategory added successfully");
        setNewSubCategoryName("");
        setNewSubCategoryImage(null);
        setSubCategoryImagePreview(null);
        setShowAddSubCategoryForm(false);
        fetchCategoryDetails();
      }
    } catch (error: any) {
      console.error("Error adding subcategory:", error);
      toast.error(error.response?.data?.message || "Failed to add subcategory");
    } finally {
      setSubmittingSubCategory(false);
    }
  };

  // Update subcategory
  const handleUpdateSubCategory = async (subCategoryId: number) => {
    if (!editingSubCategoryName.trim()) {
      toast.error("Please enter a subcategory name");
      return;
    }

    try {
      const response = await axiosClient.put(`/pharmacy/medicinecategory/updatemedicinesubcategory/${subCategoryId}`, {
        name: editingSubCategoryName
      });

      if (response.data.success || response.status === 200) {
        toast.success("Subcategory updated successfully");
        setEditingSubCategoryId(null);
        setEditingSubCategoryName("");
        fetchCategoryDetails();
      }
    } catch (error: any) {
      console.error("Error updating subcategory:", error);
      toast.error(error.response?.data?.message || "Failed to update subcategory");
    }
  };

  // Delete subcategory
  const handleDeleteSubCategory = async (subCategoryId: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }

    try {
      setDeletingSubCategoryId(subCategoryId);
      const response = await axiosClient.delete(`/pharmacy/medicinecategory/deactivatemedicinesubcategory/${subCategoryId}`);
      
      if (response.status === 200 || response.data.success) {
        toast.success("Subcategory deleted successfully");
        setSubCategories(subCategories.filter(sub => sub.id !== subCategoryId));
      }
    } catch (error: any) {
      console.error("Error deleting subcategory:", error);
      toast.error(error.response?.data?.message || "Failed to delete subcategory");
    } finally {
      setDeletingSubCategoryId(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-5 h-screen flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-5 h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <button

          className="flex items-center text-2xl font-bold text-gray-800"
        >
          <ArrowLeft size={20} className="mr-2 translate-y-[1px] cursor-pointer"            onClick={() => router.back()} />
          Medicine Category Details
        </button>
        {/* <h1 className="text-2xl font-bold text-gray-800">Medicine Category Details</h1> */}
      </div>

      {/* Category Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Category Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Category
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="flex space-x-3">
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
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save size={16} className="mr-2" />
                    Update Category
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCategoryName(originalName);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Category Name</p>
                <p className="text-lg font-medium text-gray-900">{categoryName}</p>
              </div>
              {categoryImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Category Image</p>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${categoryImage}`}
                    alt={categoryName}
                    className="w-32 h-32 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subcategories Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Subcategories</h2>
          <button
            onClick={() => setShowAddSubCategoryForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Subcategory
          </button>
        </div>

        {/* Subcategories Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden border-2 border-slate-500">
            <thead className="bg-gray-300 border-b rounded-t-xl">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Subcategory Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Subcategory Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subCategories.length > 0 ? (
                subCategories.map((subCategory) => (
                  <tr key={subCategory.id} className="hover:bg-gray-50">
                    <td>
                        <img 
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${(subCategory as any).imageUrl}`}
                            alt={subCategory.name}
                            className="w-10 h-10 rounded-lg object-cover mx-4 my-2 border"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingSubCategoryId === subCategory.id ? (
                        <input
                          type="text"
                          value={editingSubCategoryName}
                          onChange={(e) => setEditingSubCategoryName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter subcategory name"
                        />
                      ) : (
                        <div className="font-medium">{subCategory.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingSubCategoryId === subCategory.id ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateSubCategory(subCategory.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubCategoryId(null);
                              setEditingSubCategoryName("");
                            }}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setEditingSubCategoryId(subCategory.id);
                              setEditingSubCategoryName(subCategory.name);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(subCategory.id)}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              deletingSubCategoryId === subCategory.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete"
                            disabled={deletingSubCategoryId === subCategory.id}
                          >
                            {deletingSubCategoryId === subCategory.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-r-transparent rounded-full"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                    No subcategories found. Add your first subcategory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subcategory Modal */}
      {showAddSubCategoryForm && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Add New Subcategory</h3>
              <button
                onClick={() => {
                  setShowAddSubCategoryForm(false);
                  setNewSubCategoryName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter subcategory name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubCategoryImageChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                {subCategoryImagePreview && (
                  <div className="mt-3">
                    <img
                      src={subCategoryImagePreview}
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
                    setShowAddSubCategoryForm(false);
                    setNewSubCategoryName("");
                    setNewSubCategoryImage(null);
                    setSubCategoryImagePreview(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submittingSubCategory}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSubCategory}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    submittingSubCategory ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submittingSubCategory ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Subcategory'
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
