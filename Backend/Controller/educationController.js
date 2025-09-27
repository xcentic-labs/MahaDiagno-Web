import prisma from "../Utils/prismaclint.js";

// add a education detail of a doctor
export const addEducationDetail = async (req, res) => {
    const { doctorId } = req.params;
    const {courseName , universityName, yearOfPassing} = req.body;

    console.log("Adding education detail for doctor ID:", doctorId);

    // Validate input
    if (!doctorId || !courseName || !universityName || !yearOfPassing) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newEducation = await prisma.education.create({
            data: {
                courseName,
                universityName,
                yearOfPassing : Number(yearOfPassing),
                doctorId: Number(doctorId)
            }
        });

        res.status(201).json({ message: "Education detail added successfully", education: newEducation });
    } catch (error) {
        console.error("Error adding education detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// update a education detail of a doctor
export const updateEducationDetail = async (req, res) => {
    const { educationId } = req.params;
    const { courseName, universityName, yearOfPassing , doctorId } = req.body;

    try {
        // check if the same doctorId is used in the education detail
        const existingEducation = await prisma.education.findUnique({
            where: { id: Number(educationId) }
        });


        if (!existingEducation) {
            return res.status(404).json({ error: "Education detail not found" });
        }

        if (existingEducation && existingEducation.doctorId !== Number(doctorId)) {
            return res.status(403).json({ error: "Doctor ID mismatch" });
        }
        const updatedEducation = await prisma.education.update({
            where: { id: Number(educationId) },
            data: {
                courseName,
                universityName,
                yearOfPassing
            }
        });
        res.status(200).json({ message: "Education detail updated successfully", education: updatedEducation });
    } catch (error) {
        console.error("Error updating education detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// delete a education detail of a doctor
export const deleteEducationDetail = async (req, res) => {
    const { educationId , doctorId } = req.params;

    try {
        const existingEducation = await prisma.education.findUnique({
            where: { id: Number(educationId) }
        });

        if (!existingEducation) {
            return res.status(404).json({ error: "Education detail not found" });
        }

        if (existingEducation.doctorId !== Number(doctorId)) {
            return res.status(403).json({ error: "Doctor ID mismatch" });
        }

        const education = await prisma.education.delete({
            where: { id: Number(educationId) }
        });
        res.status(200).json({ message: "Education detail deleted successfully", education });
    } catch (error) {
        console.error("Error deleting education detail:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// get education details of a doctor
export const getEducationDetails = async (req, res) => {
    const { doctorId } = req.params;

    console.log("Fetching education details for doctor ID:", doctorId);

    try {
        const educationDetails = await prisma.education.findMany({
            where: { doctorId: Number(doctorId) }
        });

        console.log("Education details fetched:", educationDetails);


        res.status(200).json({ message: "Education details fetched successfully", educationDetails });
    } catch (error) {
        console.error("Error fetching education details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}