import prisma from "../Utils/prismaclint.js";
import { uploadSpecializationImage } from "../Storage/specialization.js";
import deleteImage from "../Utils/deleteImage.js";

// Add new specialization
export const addSpecialization = async (req, res) => {
    uploadSpecializationImage(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            const imageUrl = req.files?.image ? req.files.image[0].filename : null;
            const { key, label } = req.body;

            // Validate required fields
            if (!key || !label) {
                return res.status(400).json({ error: "Key and label are required" });
            }

            // Check if specialization with same key already exists
            const existingSpecialization = await prisma.specialization.findFirst({
                where: { key }
            });

            if (existingSpecialization) {
                return res.status(400).json({ error: "Specialization with this key already exists" });
            }

            // Create new specialization
            const newSpecialization = await prisma.specialization.create({
                data: {
                    key,
                    label,
                    imageUrl: imageUrl ? `specializationimage/${imageUrl}` : ""
                }
            });

            return res.status(201).json({
                success: true,
                message: "Specialization added successfully",
                data: newSpecialization
            });

        } catch (error) {
            console.error("Error adding specialization:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Get all specializations
export const getAllSpecializations = async (req, res) => {
    try {
        const specializations = await prisma.specialization.findMany({});

        return res.status(200).json({
            success: true,
            message: "Specializations retrieved successfully",
            specializations
        });

    } catch (error) {
        console.error("Error getting specializations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get specialization by ID
export const getSpecializationById = async (req, res) => {
    try {
        const { id } = req.params;

        const specialization = await prisma.specialization.findUnique({
            where: { id: parseInt(id) },
            include: {
                symptoms: true,
                doctor: {
                    select: {
                        id: true,
                        fName: true,
                        lName: true,
                        displayName: true,
                        imageUrl: true
                    }
                }
            }
        });

        if (!specialization) {
            return res.status(404).json({ error: "Specialization not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Specialization retrieved successfully",
            data: specialization
        });

    } catch (error) {
        console.error("Error getting specialization:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update specialization
export const updateSpecialization = async (req, res) => {
    uploadSpecializationImage(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { id } = req.params;
            const { key, label } = req.body;
            const imageUrl = req.files?.image ? req.files.image[0].filename : null;

            // Check if specialization exists
            const existingSpecialization = await prisma.specialization.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingSpecialization) {
                return res.status(404).json({ error: "Specialization not found" });
            }

            // Prepare update data
            const updateData = {};
            if (key) updateData.key = key;
            if (label) updateData.label = label;
            if (imageUrl) {
                // Delete old image if exists
                if (existingSpecialization.imageUrl) {
                    deleteImage(existingSpecialization.imageUrl);
                }
                updateData.imageUrl = `specializationimage/${imageUrl}`;
            }

            // Update specialization
            const updatedSpecialization = await prisma.specialization.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: "Specialization updated successfully",
                data: updatedSpecialization
            });

        } catch (error) {
            console.error("Error updating specialization:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Delete specialization
export const deleteSpecialization = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if specialization exists
        const existingSpecialization = await prisma.specialization.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        doctor: true,
                        symptoms: true
                    }
                }
            }
        });

        if (!existingSpecialization) {
            return res.status(404).json({ error: "Specialization not found" });
        }

        // Check if specialization is being used by doctors
        if (existingSpecialization._count.doctor > 0) {
            return res.status(400).json({ 
                error: "Cannot delete specialization. It is being used by doctors." 
            });
        }

        // Delete associated symptoms first
        if (existingSpecialization._count.symptoms > 0) {
            await prisma.symptom.deleteMany({
                where: { specializationId: parseInt(id) }
            });
        }

        // Delete the image if exists
        if (existingSpecialization.imageUrl) {
            deleteImage(existingSpecialization.imageUrl);
        }

        // Delete specialization
        await prisma.specialization.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            success: true,
            message: "Specialization deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting specialization:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
