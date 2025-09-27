import prisma from "../Utils/prismaclint.js";
import { uploadSymptomImage } from "../Storage/symptom.js";
import deleteImage from "../Utils/deleteImage.js";

// Add new symptom
export const addSymptom = async (req, res) => {
    uploadSymptomImage(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            const imageUrl = req.files?.image ? req.files.image[0].filename : null;
            const { name, specializationId } = req.body;

            // Validate required fields
            if (!name || !specializationId) {
                return res.status(400).json({ error: "Name and specializationId are required" });
            }

            // Check if specialization exists
            const specialization = await prisma.specialization.findUnique({
                where: { id: parseInt(specializationId) }
            });

            if (!specialization) {
                return res.status(404).json({ error: "Specialization not found" });
            }

            // Check if symptom with same name already exists for this specialization
            const existingSymptom = await prisma.symptom.findFirst({
                where: { 
                    name,
                    specializationId: parseInt(specializationId)
                }
            });

            if (existingSymptom) {
                return res.status(400).json({ 
                    error: "Symptom with this name already exists for this specialization" 
                });
            }

            // Create new symptom
            const newSymptom = await prisma.symptom.create({
                data: {
                    name,
                    specializationId: parseInt(specializationId),
                    imageUrl: imageUrl ? `symptom/${imageUrl}` : ""
                },
                include: {
                    specialization: {
                        select: {
                            id: true,
                            key: true,
                            label: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                message: "Symptom added successfully",
                data: newSymptom
            });

        } catch (error) {
            console.error("Error adding symptom:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Get all symptoms
export const getAllSymptoms = async (req, res) => {
    try {
        const { specializationId } = req.query;
        
        let whereCondition = {};
        if (specializationId) {
            whereCondition.specializationId = parseInt(specializationId);
        }

        const symptoms = await prisma.symptom.findMany({
            where: whereCondition,
            include: {
                specialization: {
                    select: {
                        id: true,
                        key: true,
                        label: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Symptoms retrieved successfully",
            symptoms
        });

    } catch (error) {
        console.error("Error getting symptoms:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get symptom by ID
export const getSymptomById = async (req, res) => {
    try {
        const { id } = req.params;

        const symptom = await prisma.symptom.findUnique({
            where: { id: parseInt(id) },
            include: {
                specialization: {
                    select: {
                        id: true,
                        key: true,
                        label: true,
                        imageUrl: true
                    }
                }
            }
        });

        if (!symptom) {
            return res.status(404).json({ error: "Symptom not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Symptom retrieved successfully",
            data: symptom
        });

    } catch (error) {
        console.error("Error getting symptom:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get symptoms by specialization
export const getSymptomsBySpecialization = async (req, res) => {
    try {
        const { specializationId } = req.params;

        // Check if specialization exists
        const specialization = await prisma.specialization.findUnique({
            where: { id: parseInt(specializationId) }
        });

        if (!specialization) {
            return res.status(404).json({ error: "Specialization not found" });
        }

        const symptoms = await prisma.symptom.findMany({
            where: { specializationId: parseInt(specializationId) },
            include: {
                specialization: {
                    select: {
                        id: true,
                        key: true,
                        label: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Symptoms retrieved successfully",
            data: symptoms
        });

    } catch (error) {
        console.error("Error getting symptoms by specialization:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update symptom
export const updateSymptom = async (req, res) => {
    uploadSymptomImage(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { id } = req.params;
            const { name, specializationId } = req.body;
            const imageUrl = req.files?.image ? req.files.image[0].filename : null;

            // Check if symptom exists
            const existingSymptom = await prisma.symptom.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingSymptom) {
                return res.status(404).json({ error: "Symptom not found" });
            }

            // If specializationId is provided, check if it exists
            if (specializationId) {
                const specialization = await prisma.specialization.findUnique({
                    where: { id: parseInt(specializationId) }
                });

                if (!specialization) {
                    return res.status(404).json({ error: "Specialization not found" });
                }
            }

            // Prepare update data
            const updateData = {};
            if (name) updateData.name = name;
            if (specializationId) updateData.specializationId = parseInt(specializationId);
            if (imageUrl) {
                // Delete old image if exists
                if (existingSymptom.imageUrl) {
                    deleteImage(existingSymptom.imageUrl);
                }
                updateData.imageUrl = `symptom/${imageUrl}`;
            }

            // Update symptom
            const updatedSymptom = await prisma.symptom.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    specialization: {
                        select: {
                            id: true,
                            key: true,
                            label: true,
                            imageUrl: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                message: "Symptom updated successfully",
                data: updatedSymptom
            });

        } catch (error) {
            console.error("Error updating symptom:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Delete symptom
export const deleteSymptom = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if symptom exists
        const existingSymptom = await prisma.symptom.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingSymptom) {
            return res.status(404).json({ error: "Symptom not found" });
        }

        // Delete the image if exists
        if (existingSymptom.imageUrl) {
            deleteImage(existingSymptom.imageUrl);
        }

        // Delete symptom
        await prisma.symptom.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            success: true,
            message: "Symptom deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting symptom:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
