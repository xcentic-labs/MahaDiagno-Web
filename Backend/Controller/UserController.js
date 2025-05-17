import prisma from "../Utils/prismaclint.js";
import { sentopt } from "../Utils/otp.js";

export const getopt = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) return res.status(400).json({ "error": "Phone Number is Required" });
        if (phoneNumber.length != 10) return res.status(400).json({ "error": "Require Valid Phone Number" });

        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        })

        if (!user) {
            const createUser = await prisma.user.create({
                data: {
                    phoneNumber: phoneNumber
                }
            });

            if (!createUser) return res.status(500).json({ "error": "Unable to create user" });
        }

        const isSent = await sentopt();

        if (isSent != 200) return res.status(502).json({ "error": "Unable to sent OTP" });

        return res.status(200).json({ "message": "OTP sent Sucessfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to sent OTP Internal server error" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        console.log(req.body);
        const { firstName, lastName, email } = req.body;

        if (!firstName || !lastName || !email) return res.json({ "error": "Require All filed for Update" });

        const user = await prisma.user.update({
            where: {
                id: +id
            },
            data: {
                first_name: firstName,
                last_name: lastName,
                email: email
            }
        });

        if (!user) return res.status(500).json({ "error": "Unable to Update User" });
        return res.status(200).json({ "message": "User Updated Sucessfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Update User Internal server error" });
    }
}


export const verifyOtp = async (req, res) => {
    try {
        const { otp, phoneNumber } = req.body

        if (!otp || !phoneNumber) return res.status(400).json({ "error": "All fields Are Required" });

        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        })

        if (otp != '1234') return res.status(400).json({ "error": "Invalid OTP" });
        return res.status(200).json({ "message": "OTP Matched", user: user });
    } catch (error) {
        return res.status(500).json({ "error": "Unable to process OTP internal server error" });
    }
}

export const getUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ "error": "All fields Are Required" });

        const user = await prisma.user.findUnique({
            where: {
                id: +id
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                userId: true
            }
        });

        const userData = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            appointments: user.userId.map((app) => {
                return {
                    id: app.id,
                    patientFirstName: app.patient_first_name,
                    patientLastName: app.patient_last_name,
                    patientAge: app.patient_age,
                    gender: app.gender,
                    referringDoctor: app.referring_doctor,
                    additionalPhoneNumber: app.additional_phone_number,
                    status: app.status,
                }
            })
        };



        if (!user) return res.status(404).json({ "error": "User Not Found" });
        return res.status(200).json({
            "message": "User get sucessfully", userData: userData
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ "error": "Unable to get user Internal server error" });
    }
}

export const getAllUser = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                _count: {
                    select: {
                        userId: true,
                    }
                }
            }
        });

        const allUser = user.map((user) => {
            return {
                phoneNumber: user.phoneNumber,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                id: user.id,
                totalAppointments: user._count.userId
            }
        });

        if (!user) return res.status(404).json({ "error": "Unable To Get User" });
        return res.status(200).json({ "message": "User get sucessfully", userData: allUser });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ "error": "Unable to get user Internal server error" });
    }
}


export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ "error": "All fields Are Required" });

        console.log(id);

        await prisma.appointment.deleteMany({
            where: {
                userId: +id
            }
        })

        await prisma.address.deleteMany({
            where: {
                userId: +id
            }
        })

        const user = await prisma.user.delete({
            where: {
                id: +id
            }
        });

        if (!user) return res.status(404).json({ "error": "User Not Found" });

        return res.status(200).json({ "message": "User Deleted sucessfully" });

    } catch (error) {
        console.log(error);
        return res.status(404).json({ "error": "Unable to get user Internal server error" });
    }
}