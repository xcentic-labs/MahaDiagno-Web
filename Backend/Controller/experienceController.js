import prisma from "../Utils/prismaclint.js";

// add experience detail of a doctor
export const addExperienceDetail = async (req, res) => {
    const { doctorId } = req.params;
    const { title, hospital, employmentType, from, to, currentlyWorking } = req.body;

    console.log("Adding experience detail for doctor ID:", doctorId);

    // Validate input
    if (!doctorId || !title || !hospital || !employmentType || !from) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newExperience = await prisma.experience.create({
            data: {
                title,
                hospital,
                employmentType,
                from,
                to,
                currentlyWorking,
                doctorId: Number(doctorId)
            }
        });
        res.status(201).json({ message: "Experience detail added successfully", experience: newExperience });
    } catch (error) {
        console.error("Error adding experience detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


// update experience detail of a doctor
export const updateExperienceDetail = async (req, res) => {
    const { experienceId, doctorId } = req.params;
    const { title, hospital, employmentType, from, to, currentlyWorking } = req.body;

    try {
        const existingExperience = await prisma.experience.findUnique({
            where: { id: Number(experienceId) }
        });

        if (!existingExperience) {
            return res.status(404).json({ error: "Experience detail not found" });
        }

        if (existingExperience.doctorId !== Number(doctorId)) {
            return res.status(403).json({ error: "Doctor ID mismatch" });
        }

        const updatedExperience = await prisma.experience.update({
            where: { id: Number(experienceId) },
            data: {
                title,
                hospital,
                employmentType,
                from,
                to,
                currentlyWorking
            }
        });
        res.status(200).json({ message: "Experience detail updated successfully", experience: updatedExperience });
    } catch (error) {
        console.error("Error updating experience detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// delete experience detail of a doctor
export const deleteExperienceDetail = async (req, res) => {
    const { experienceId, doctorId } = req.params;

    try {
        const existingExperience = await prisma.experience.findUnique({
            where: { id: Number(experienceId) }
        });

        if (!existingExperience) {
            return res.status(404).json({ error: "Experience detail not found" });
        }

        if (existingExperience.doctorId !== Number(doctorId)) {
            return res.status(403).json({ error: "Doctor ID mismatch" });
        }

        await prisma.experience.delete({
            where: { id: Number(experienceId) }
        });
        res.status(200).json({ message: "Experience detail deleted successfully" });
    } catch (error) {
        console.error("Error deleting experience detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get all experience details of a doctor
export const getExperienceDetails = async (req, res) => {
    const { doctorId } = req.params;

    try {
        const experiences = await prisma.experience.findMany({
            where: { doctorId: Number(doctorId) },
            orderBy: { from: 'desc' }
        });

        console.log("Experience details fetched:", experiences);
        
        res.status(200).json(experiences);
    } catch (error) {
        console.error("Error fetching experience details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};