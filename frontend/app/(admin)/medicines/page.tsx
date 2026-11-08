"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Pill, RefreshCw, Search } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";
import { toast } from "react-toastify";

interface Medicine {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  finalPrice: number;
  imageUrl: string;
  quantityDescription: string;
  medicineCategory?: { id: number; name: string };
  medicineSubCategory?: { id: number; name: string };
  pharmacyVendor?: { id: number; name: string; shopName: string };
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "");
const rupee = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

// All active medicines listed by pharmacy vendors. Admin can review and deactivate them.
export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/pharmacy/medicine/getallmedicines");
      setMedicines(res.data.data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const vendors = useMemo(() => {
    const map = new Map<number, string>();
    medicines.forEach((m) => m.pharmacyVendor && map.set(m.pharmacyVendor.id, m.pharmacyVendor.shopName || m.pharmacyVendor.name));
    return [...map.entries()];
  }, [medicines]);

  const categories = useMemo(() => {
    const map = new Map<number, string>();
    medicines.forEach((m) => m.medicineCategory && map.set(m.medicineCategory.id, m.medicineCategory.name));
    return [...map.entries()];
  }, [medicines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicines.filter(
      (m) =>
        (!vendor || String(m.pharmacyVendor?.id) === vendor) &&
        (!category || String(m.medicineCategory?.id) === category) &&
        (!q || [m.name, m.brand, m.pharmacyVendor?.shopName].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [medicines, vendor, category, search]);

  const handleDeactivate = async (m: Medicine) => {
    if (!confirm(`Deactivate "${m.name}"? It will no longer be shown to users.`)) return;
    try {
      setDeactivatingId(m.id);
      await axiosClient.delete(`/pharmacy/medicine/deactivatemedicine/${m.id}`);
      toast.success("Medicine deactivated");
      setMedicines((list) => list.filter((x) => x.id !== m.id));
    } catch (error: any) {
      console.error("Error deactivating medicine:", error);
      toast.error(error.response?.data?.error || "Failed to deactivate medicine");
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Medicines</h1>
          <p className="text-muted-foreground">Active medicines listed by all pharmacy vendors</p>
        </div>
        <Button variant="outline" onClick={fetchMedicines} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <CardTitle>Medicine List</CardTitle>
            <CardDescription>{filtered.length} of {medicines.length} medicines</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8 sm:w-56" placeholder="Search name, brand, shop" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={vendor} onChange={(e) => setVendor(e.target.value)}>
              <option value="">All vendors</option>
              {vendors.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
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
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-3 font-medium">Medicine</th>
                    <th className="py-2 pr-3 font-medium">Vendor</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium">Pack</th>
                    <th className="py-2 pr-3 font-medium text-right">MRP</th>
                    <th className="py-2 pr-3 font-medium text-right">Selling</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 align-middle">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {m.imageUrl ? (
                              <img src={`${SERVER_URL}/${m.imageUrl}`} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <Pill className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">{m.pharmacyVendor?.shopName || m.pharmacyVendor?.name || "—"}</td>
                      <td className="py-3 pr-3">
                        <Badge variant="secondary">{m.medicineCategory?.name || "—"}</Badge>
                        {m.medicineSubCategory && <p className="text-xs text-muted-foreground mt-1">{m.medicineSubCategory.name}</p>}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{m.quantityDescription}</td>
                      <td className="py-3 pr-3 text-right text-muted-foreground line-through">{rupee(m.price)}</td>
                      <td className="py-3 pr-3 text-right font-semibold">{rupee(m.finalPrice)}</td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deactivatingId === m.id}
                          onClick={() => handleDeactivate(m)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {deactivatingId === m.id ? "..." : "Deactivate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
