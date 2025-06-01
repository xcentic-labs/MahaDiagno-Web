import prisma from "../Utils/prismaclint.js";
import { generatePassword , matchedPassword } from "../Utils/password.js";


export const createPartnersAccount = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password , addressId } = req.body

        console.log(req.body)
        if (!hospitalName || !phoneNumber || !email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const hasedPassword = generatePassword(password);

        const partners = await prisma.partners.create({
            data: {
                hospitalName: hospitalName,
                email: email,
                phoneNuber: phoneNumber,
                password: hasedPassword,
                addressId : addressId
            }
        })

        console.log(partners)

        if (!partners) return res.status(500).json({ "error": "Unable Create Partners Account" });
        return res.status(201).json({ "message": "Partners account Created Sucessfully" });
    } catch (error) {
        console.log(error)
        if (error.code == 'P2002') {
            return res.status(409).json({ "error": "Partners Aleardy Exist" });
        }
        return res.status(500).json({ "error": "Unable To Create Partners Account Internal Server Error" });
    }
}

export const deletePartners = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const partners = await prisma.partners.delete({
            where: {
                id: +id
            }
        })
        if (!partners) return res.status(500).json({ "error": "Unable To Delete partners" });
        return res.status(200).json({ "message": "partners Deleted Sucessfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Delete partners Internal Server Error" });
    }
}

export const getAllPartners = async (req, res) => {
    try {

        const partners = await prisma.partners.findMany({
            select: {
                id: true,
                hospitalName: true,
                phoneNuber: true,
                email: true,
                _count: {
                    select: {
                        subscription_purchase: true
                    }
                }
            }
        })


        if (!partners) return res.status(500).json({ "error": "Unable To Fetch Partners" });
        return res.status(200).json({ "message": "Partners Fetched Sucessfully", partners: partners });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Partners Internal Server Error" });
    }
}

export const getPartners = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const partners = await prisma.partners.findUnique({
            where: {
                id: +id
            },
            select: {
                id: true,
                hospitalName: true,
                phoneNuber: true,
                email: true,
            }
        });

        if (!partners) return res.status(500).json({ "error": "Unable To Get Partner" });
        return res.status(200).json({ "message": "Partner Fetched Sucessfully", partners: partners });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Get Partner Internal Server Error" });
    }
}

export const partnersLogin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body

        if (!phoneNumber || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const partners = await prisma.partners.findUnique({
            where: {
                phoneNumber: phoneNumber
            },
            select: {
                id: true,
                hospitalName: true,
                phoneNuber: true,
                email: true,
            }
        })

        if (!partners) return res.status(404).json({ "error": "No User Exist" });


        if (!matchedPassword(password, partners.password)) return res.status(403).json({ "error": "Password Is Incorrect" });

        return res.status(200).json({
            "message": "LoggedIn Sucessfull", partners: partners
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}