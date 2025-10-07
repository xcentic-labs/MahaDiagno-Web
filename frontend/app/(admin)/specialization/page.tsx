"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { Specialization, SpecializationResponse } from "@/lib/types";
import { toast } from "react-toastify";

export default function SpecializationPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    label: "",
    key: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch all specializations
  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<SpecializationResponse>("/specialization/getall");
      if (response.data.success) {
        setSpecializations(response.data.specializations);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to fetch specializations");
    } finally {
      setLoading(false);
    }
  };

  // Generate key from label
  const generateKey = (label: string) => {
    return label.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Handle label change and auto-generate key
  const handleLabelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      label: value,
      key: generateKey(value)
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new specialization
  const handleAddSpecialization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label || !formData.key || !formData.image) {
      toast.error("Please fill in all fields and select an image");
      return;
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("key", formData.key);
      formDataToSend.append("label", formData.label);

      const response = await axiosClient.post("/specialization/add", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Specialization added successfully");
        setFormData({ label: "", key: "", image: null });
        setImagePreview(null);
        setShowAddForm(false);
        fetchSpecializations(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error adding specialization:", error);
      toast.error(error.response?.data?.message || "Failed to add specialization");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete specialization
  const handleDeleteSpecialization = async (id: number) => {
    if (!confirm("Are you sure you want to delete this specialization?")) {
      return;
    }

    try {
      const response = await axiosClient.delete(`/specialization/delete/${id}`);
      if (response.data.success) {
        toast.success("Specialization deleted successfully");
        fetchSpecializations(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error deleting specialization:", error);
      toast.error(error.response?.data?.message || "Failed to delete specialization");
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Doctor Specializations</h1>
          <p className="text-muted-foreground">Manage doctor specializations and categories</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Specialization
        </Button>
      </div>

      {/* Add Specialization Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Specialization</CardTitle>
            <CardDescription>Create a new doctor specialization category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSpecialization} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    type="text"
                    placeholder="e.g., General Physician, Cardiologist"
                    value={formData.label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Key (Auto-generated)</Label>
                  <Input
                    id="key"
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Will be auto-generated"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Specialization Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                    required
                  />
                  {imagePreview && (
                    <div className="w-20 h-20 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Specialization"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ label: "", key: "", image: null });
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Specializations List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Specializations</CardTitle>
          <CardDescription>
            {specializations.length} specialization{specializations.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : specializations.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No specializations found</p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="mt-4"
              >
                Add First Specialization
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specializations.map((specialization) => (
                <Card key={specialization.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{specialization.label}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {specialization.key}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSpecialization(specialization.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {specialization.imageUrl && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/${specialization.imageUrl}`}
                          alt={specialization.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="flex items-center justify-center h-full text-gray-400">
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}