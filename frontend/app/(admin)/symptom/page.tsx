"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Pencil, Image as ImageIcon, Search } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { Specialization, SpecializationResponse } from "@/lib/types";
import { toast } from "react-toastify";

interface Symptom {
  id: number;
  name: string;
  imageUrl: string;
  specializationId: number;
  specialization?: { id: number; key: string; label: string };
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "");

const emptyForm = { name: "", specializationId: "", image: null as File | null };

export default function SymptomPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Symptom | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/symptom/getall");
      setSymptoms(res.data.symptoms || []);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      toast.error("Failed to fetch symptoms");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const res = await axiosClient.get<SpecializationResponse>("/specialization/getall");
      setSpecializations(res.data.specializations || []);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to fetch specializations");
    }
  };

  useEffect(() => {
    fetchSymptoms();
    fetchSpecializations();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return symptoms.filter(
      (s) =>
        (!filter || String(s.specializationId) === filter) &&
        (!q || s.name.toLowerCase().includes(q))
    );
  }, [symptoms, filter, search]);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(emptyForm);
    setImagePreview(null);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (symptom: Symptom) => {
    setEditing(symptom);
    setFormData({ name: symptom.name, specializationId: String(symptom.specializationId), image: null });
    setImagePreview(symptom.imageUrl ? `${SERVER_URL}/${symptom.imageUrl}` : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specializationId) {
      toast.error("Name and specialization are required");
      return;
    }
    if (!editing && !formData.image) {
      toast.error("Please select an image");
      return;
    }

    const body = new FormData();
    body.append("name", formData.name.trim());
    body.append("specializationId", formData.specializationId);
    if (formData.image) body.append("image", formData.image);

    try {
      setSubmitting(true);
      if (editing) {
        await axiosClient.put(`/symptom/update/${editing.id}`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Symptom updated successfully");
      } else {
        await axiosClient.post("/symptom/add", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Symptom added successfully");
      }
      closeForm();
      fetchSymptoms();
    } catch (error: any) {
      console.error("Error saving symptom:", error);
      toast.error(error.response?.data?.error || "Failed to save symptom");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this symptom?")) return;
    try {
      await axiosClient.delete(`/symptom/delete/${id}`);
      toast.success("Symptom deleted successfully");
      fetchSymptoms();
    } catch (error: any) {
      console.error("Error deleting symptom:", error);
      toast.error(error.response?.data?.error || "Failed to delete symptom");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Symptoms</h1>
          <p className="text-muted-foreground">Symptoms patients pick to find the right specialist</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Symptom
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Symptom" : "Add New Symptom"}</CardTitle>
            <CardDescription>Each symptom is linked to one doctor specialization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Symptom Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fever, Chest pain"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <select
                    id="specialization"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={formData.specializationId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, specializationId: e.target.value }))}
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((sp) => (
                      <option key={sp.id} value={sp.id}>{sp.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Symptom Image {editing && "(leave empty to keep current)"}</Label>
                <div className="flex items-center gap-4">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                  {imagePreview && (
                    <div className="w-20 h-20 border rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Update Symptom" : "Add Symptom"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Existing Symptoms</CardTitle>
            <CardDescription>{filtered.length} of {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 sm:w-56" placeholder="Search symptom" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All specializations</option>
              {specializations.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No symptoms found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((symptom) => (
                <Card key={symptom.id}>
                  <CardContent className="p-4">
                    <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                      {symptom.imageUrl ? (
                        <img src={`${SERVER_URL}/${symptom.imageUrl}`} alt={symptom.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{symptom.name}</h3>
                        {symptom.specialization && (
                          <Badge variant="secondary" className="mt-1 text-xs">{symptom.specialization.label}</Badge>
                        )}
                      </div>
                      <div className="flex">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(symptom)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(symptom.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
