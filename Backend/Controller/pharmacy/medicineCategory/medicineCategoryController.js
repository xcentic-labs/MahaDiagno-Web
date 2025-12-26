import prisma from "../../../Utils/prismaclint.js";
import { uploadMedicineCategory } from "../../../Storage/pharmacyStorage/medicineCategory.js";


// ====================== Medicine Category ======================
export const addMedicineCategory = async (req, res) => {
    uploadMedicineCategory(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            console.log("Uploaded image URL:", req.files);
            const imageUrl = req.files.medicineCategory ? req.files.medicineCategory[0].filename : null;

            const { name } = req.body;

            // Validate required fields
            if (!name.trim() || !imageUrl) {
                return res.status(400).json({ error: "Name and image are required" });
            }

            const newMedicineCategory = await prisma.medicineCategory.create({
                data: {
                    name,
                    imageUrl: imageUrl ? `medicinecategory/${imageUrl}` : ""
                }
            });

            if (!newMedicineCategory) {
                return res.status(500).json({ error: "Failed to create medicine category" });
            }

            return res.status(201).json({ message: "Medicine category added successfully", data: newMedicineCategory });
        } catch (error) {
            console.error("Error adding medicine category:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};


export const updateMedicinNameCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await prisma.medicineCategory.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        return res.status(200).json({ message: "Medicine category updated successfully", data: updatedCategory });
    }
    catch (error) {
        console.error("Error updating medicine category:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedicineCategories = async (req, res) => {
    try {
        const categories = await prisma.medicineCategory.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });
        return res.status(200).json({ 
            success: true,
            message : "Medicine categories fetched successfully",
            data: categories 
        });
    } catch (error) {
        console.error("Error fetching medicine categories:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deactivateMedicineCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await prisma.medicineCategory.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        return res.status(200).json({ message: "Medicine category deactivated successfully", data: updatedCategory });
    } catch (error) {
        console.error("Error deactivating medicine category:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getMedicineCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.medicineCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                medicineSubCategory: {
                    where: { isActive: true },
                }
            }
        });
        if (!category) {
            return res.status(404).json({ error: "Medicine category not found" });
        }
        return res.status(200).json({ data: category });
    } catch (error) {
        console.error("Error fetching medicine category by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// ====================== Medicine Sub Category ======================
export const addMedicineSubCategory = async (req, res) => {
    uploadMedicineCategory(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            const imageUrl = req.files?.medicineSubCategory ? req.files.medicineSubCategory[0].filename : null;
            const { name, medicineCategoryId } = req.body;

            // Validate required fields
            if (!name.trim() || !imageUrl || !medicineCategoryId) {
                return res.status(400).json({ error: "Name, image, and medicineCategoryId are required" });
            }

            const newMedicineSubCategory = await prisma.medicineSubCategory.create({
                data: {
                    name,
                    imageUrl: imageUrl ? `medicinesubcategory/${imageUrl}` : "",
                    medicineCategoryId: parseInt(medicineCategoryId)
                }
            });
            if (!newMedicineSubCategory) {
                return res.status(500).json({ error: "Failed to create medicine sub category" });
            }
            return res.status(201).json({ message: "Medicine sub category added successfully", data: newMedicineSubCategory });
        }
        catch (error) {
            console.error("Error adding medicine sub category:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
}


export const updateMedicineSubCategoryName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedSubCategory = await prisma.medicineSubCategory.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        return res.status(200).json({ message: "Medicine sub category updated successfully", data: updatedSubCategory });
    }
    catch (error) {
        console.error("Error updating medicine sub category:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deactivateMedicineSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSubCategory = await prisma.medicineSubCategory.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        return res.status(200).json({ message: "Medicine sub category deactivated successfully", data: updatedSubCategory });
    } catch (error) {
        console.error("Error deactivating medicine sub category:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedicineSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const subCategories = await prisma.medicineSubCategory.findMany({
            where: { isActive: true, medicineCategoryId: parseInt(categoryId) },
            orderBy: { id: 'asc' }
        });

        return res.status(200).json({ data: subCategories });

    } catch (error) {
        console.error("Error fetching medicine sub categories:", error);
        return res.status(500).json({ error: "Internal server error" });
    }   
};


