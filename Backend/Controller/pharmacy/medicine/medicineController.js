import { uploadMedicineImage } from "../../../Storage/pharmacyStorage/medicine.js";
import prisma from "../../../Utils/prismaclint.js";


// ====================== Medicine ======================
export const addMedicine = async (req, res) => {
    uploadMedicineImage(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            const imageUrl = req.files?.image ? req.files.image[0].filename : null;
            const { name, description, brand, price, finalPrice, quantityDescription, medicineCategoryId, medicineSubCategoryId, pharmacyVendorId } = req.body;

            // Validate required fields
            if (!name.trim() || !description.trim() || !brand.trim() || !price || !finalPrice || !quantityDescription.trim() || !medicineCategoryId || !medicineSubCategoryId || !pharmacyVendorId || !imageUrl) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const newMedicine = await prisma.medicine.create({
                data: {
                    name,
                    description,
                    brand,
                    price: parseFloat(price),
                    finalPrice: parseFloat(finalPrice),
                    quantityDescription,
                    medicineCategoryId: parseInt(medicineCategoryId),
                    medicineSubCategoryId: parseInt(medicineSubCategoryId),
                    pharmacyVendorId: parseInt(pharmacyVendorId),
                    imageUrl: imageUrl ? `medicineimage/${imageUrl}` : ""
                }
            });
            if (!newMedicine) {
                return res.status(500).json({ error: "Failed to create medicine" });
            }

            return res.status(201).json({ message: "Medicine added successfully", data: newMedicine });
        } catch (error) {
            console.error("Error adding medicine:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};


export const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, brand, price, finalPrice, quantityDescription } = req.body;
        const updatedMedicine = await prisma.medicine.update({
            where: { id: parseInt(id) },
            data: { name, description, brand, price: parseFloat(price), finalPrice: parseFloat(finalPrice), quantityDescription }
        });
        return res.status(200).json({ message: "Medicine updated successfully", data: updatedMedicine });
    }
    catch (error) {
        console.error("Error updating medicine:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllMedicines = async (req, res) => {

    try {

        // filter by category and subcategory

        const { categoryId, subCategoryId , pharmacyVendorId } = req.query;

        let filter = { isActive: true };
        if (categoryId) {
            filter.medicineCategoryId = parseInt(categoryId);
        }

        if (subCategoryId) {
            filter.medicineSubCategoryId = parseInt(subCategoryId);
        }

        if (pharmacyVendorId) {
            filter.pharmacyVendorId = parseInt(pharmacyVendorId);
        }

        const medicines = await prisma.medicine.findMany({
            where: filter,
            include: {
                medicineCategory: true,
                medicineSubCategory: true,
                pharmacyVendor: true
            }
        });
        return res.status(200).json({ data: medicines });
    }
    catch (error) {
        console.error("Error fetching medicines:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getMedicinesByPharmacyVendor = async (req, res) => {
    try {
        const { pharmacyVendorId } = req.params;
        const medicines = await prisma.medicine.findMany({
            where: { pharmacyVendorId: parseInt(pharmacyVendorId), isActive: true },
            select: {
                id: true,
                name: true,
                brand: true,
                description: true,
                price: true,
                finalPrice: true,
                imageUrl: true,
                quantityDescription: true,
                isActive: true,
                medicineCategory: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                medicineSubCategory: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                pharmacyVendor : {
                    select: {
                        id: true,
                        shopName: true
                    }
                }

            }
        });
        return res.status(200).json({ data: medicines });
    }
    catch (error) {
        console.error("Error fetching medicines by pharmacy vendor:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deactivateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMedicine = await prisma.medicine.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        return res.status(200).json({ message: "Medicine deactivated successfully", data: updatedMedicine });
    }
    catch (error) {
        console.error("Error deactivating medicine:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await prisma.medicine.findUnique({
            where: { id: parseInt(id) },
            include: {
                medicineCategory: true,
                medicineSubCategory: true,
                pharmacyVendor: true
            }
        });
        if (!medicine) {
            return res.status(404).json({ error: "Medicine not found" });
        }

        return res.status(200).json({ data: medicine });
    }
    catch (error) {
        console.error("Error fetching medicine by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};