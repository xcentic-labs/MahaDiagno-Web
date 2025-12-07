import prisma from "../Utils/prismaclint.js";
import { generatePassword, matchedPassword } from "../Utils/password.js";
import { generateToken } from "../Utils/jwt.js";
import logError from "../Utils/log.js";

export const addAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body

        if (!firstName || !lastName || !email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const hasedPassword = generatePassword(password);

        const admin = await prisma.admin.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: hasedPassword,
            }
        })

        if (!admin) return res.status(500).json({ "error": "Unable To Add Admin" });
        return res.status(201).json({ "message": "Admin Added Sucessfully" });
    } catch (error) {
        logError(error);
        if (error.code == 'P2002') {
            return res.status(409).json({ "error": "Amdin With this e-mail Aleardy Exist" });
        }
        return res.status(500).json({ "error": "Unable To Add Admin Internal Server Error" });
    }
}

export const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const admin = await prisma.admin.delete({
            where: {
                id: +id
            }
        })
        if (!admin) return res.status(500).json({ "error": "Unable To Delete  Admin" });
        return res.status(200).json({ "message": "Admin Deleted Sucessfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Delete Admin Internal Server Error" });
    }
}

export const getAdmins = async (req, res) => {
    try {
        const result = await prisma.admin.findMany({
            where: {},
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true
            }
        });


        const admins = result.map((admin) => {
            return {
                id: admin.id,
                firstName: admin.first_name,
                lastName: admin.last_name,
                email: admin.email
            }
        })

        if (!result) return res.status(500).json({ "error": "Unable to get Admins" });

        return res.status(200).json({ "message": "Admin Data fetched Sucessfully", admins: admins });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to get Admins Internal Server error" });
    }
}


export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const admin = await prisma.admin.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                password: true,
            }
        })

        if (!admin) return res.status(404).json({ "error": "No Admin Exist" });


        if (!matchedPassword(password, admin.password)) return res.status(403).json({ "error": "Password Is Incorrect" });

        const generatedToken = generateToken(admin.email, admin.id);

        return res.status(200).json({
            "message": "LoggedIn Sucessfull", admin: {
                firstName: admin.first_name,
                lastName: admin.last_name,
                email: admin.email,
                token: generatedToken
            }
        });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}

export const dashboardData = async (req, res) => {
    try {
        const [user , service, serviceBoy, doctor, partners] = await Promise.all([
            prisma.user.count(),
            prisma.services.count(),
            prisma.serviceboy.count(),
            prisma.doctor.count(),
            prisma.partners.count(),
        ]);

        const data = [
            { title : "user" ,label: 'Total Users', data: user },
            { title : "service" ,label: 'Total Services', data: service },
            { title : "serviceBoy" ,label: 'Total Service Boys', data: serviceBoy },
            { title : "doctor" ,label: 'Total Doctors', data: doctor },
            { title : "partners" ,label: 'Total Partners', data: partners },
        ]


        res.status(200).json({ data });
    } catch (error) {
        logError(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};