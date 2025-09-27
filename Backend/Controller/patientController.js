import prisma from "../Utils/prismaclint.js";

export const addPatientDetail = async (req, res) => {
    const { fname, lname, phoneNumber, email, age , gender , userId } = req.body;

    if (!fname || !lname || !phoneNumber || !email || !age || !gender || !userId) {
        return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Adding patient details:", { fname, lname, phoneNumber, email, age, gender, userId });

    try {
        const newPatient = await prisma.patient.create({
            data: {
                fname,
                lname,
                phoneNumber,
                email,
                age : Number(age),
                gender : String(gender).charAt(0).toUpperCase() + String(gender).slice(1).toLowerCase(),
                userId: Number(userId)
            }
        });
        res.status(201).json(newPatient);
    } catch (error) {
        console.error("Error adding patient details:", error);
        res.status(500).json({ error: "Failed to add patient details" });
    }
};

export const updatePatientDetail = async (req, res) => {
    const { patientId } = req.params;
    const { fname, lname, phoneNumber, email, age , gender } = req.body;

    if (!fname || !lname || !phoneNumber || !email || !age || !gender) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const updatedPatient = await prisma.patient.update({
            where: { id: Number(patientId) },
            data: {
                fname,
                lname,
                phoneNumber,
                email,
                age: Number(age),
                gender
            }
        });

        
        res.status(200).json(updatedPatient);
    } catch (error) {
        console.error("Error updating patient details:", error);
        res.status(500).json({ error: "Failed to update patient details" });
    }
};


export const deletePatientDetail = async (req, res) => {
    const { patientId } = req.params;

    if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required" });
    }

    try {
        const deletedPatient = await prisma.patient.delete({
            where: { id: Number(patientId) }
        });
        res.status(200).json(deletedPatient);
    } catch (error) {
        console.error("Error deleting patient details:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.status(500).json({ error: "Failed to delete patient details" });
    }
};

export const getPatientByUserId = async (req, res) => {
    const { userId } = req.params;

    console.log("Fetching patients for user ID:", userId);
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const patients = await prisma.patient.findMany({
            where: { userId: Number(userId) },
            select: {
                id: true,
                fname: true,
                lname: true,
                phoneNumber: true,
                email: true,
                age: true,
                gender: true
            }
        });

        console.log("Patients fetched:", patients);
        res.status(200).json(patients);
    } catch (error) {
        console.error("Error fetching patients by user ID:", error);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};