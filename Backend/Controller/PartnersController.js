import prisma from "../Utils/prismaclint.js";
import { generatePassword, matchedPassword } from "../Utils/password.js";
import { sentopt, verify2factorOtp } from "../Utils/otp.js";
import logError from "../Utils/log.js";
import { uploadPartnerBanner } from "../Storage/PartnerBanner.js";
import multer from "multer";


export const createPartnersAccount = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password, addressId } = req.body

        console.log(req.body);

        if (!hospitalName || !phoneNumber || !email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const hasedPassword = generatePassword(password);

        const partners = await prisma.partners.create({
            data: {
                hospitalName: hospitalName,
                email: email,
                phoneNumber: phoneNumber,
                password: hasedPassword,
                addressId: addressId,
            }
        });

        if (!partners) return res.status(500).json({ "error": "Unable Create Partners Account" });
        return res.status(201).json({ "message": "Partners account Created Sucessfully" });
    } catch (error) {
        console.log(error);
        logError(error);
        if (error.code == 'P2002') {
            return res.status(409).json({ "error": "Partners Aleardy Exist" });
        }
        return res.status(500).json({ "error": "Unable To Create Partners Account Internal Server Error" });
    }
}

export const deletePartners = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "Id is required" });

        // Check if partner exists
        const existingPartner = await prisma.partners.findUnique({ where: { id: +id } });
        if (!existingPartner) return res.status(404).json({ error: "Partner not found" });

        // Delete dependent records in correct order
        await prisma.appointment.deleteMany({ where: { partnerId: +id } });
        await prisma.serviceboy.deleteMany({ where: { partnerId: +id } });
        await prisma.services.deleteMany({ where: { partnerId: +id } });
        await prisma.subscription_purchase.deleteMany({ where: { partnersId: +id } });

        // Delete the partner
        await prisma.partners.delete({ where: { id: +id } });

        return res.status(200).json({ message: "Partner and related data deleted successfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ error: "Unable to delete partner. Internal server error." });
    }
};


export const getAllPartners = async (req, res) => {
    try {
        const partners = await prisma.partners.findMany({
            select: {
                id: true,
                hospitalName: true,
                phoneNumber: true,
                email: true,
                isSubscribed: true,
                _count: {
                    select: {
                        subscription_purchase: true,
                        serviceBoy: true,
                        appointment: true,
                        services: true
                    }
                }
            }
        })


        if (!partners) return res.status(500).json({ "error": "Unable To Fetch Partners" });
        return res.status(200).json({ "message": "Partners Fetched Sucessfully", partners: partners });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Fetch Partners Internal Server Error" });
    }
}

export const getPartners = async (req, res) => {
    try {
        const id = req.params.id

        console.log(id);

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const partners = await prisma.partners.findUnique({
            where: {
                id: +id
            },
            include: {
                subscription_purchase: true,
                serviceBoy: true,
                appointment: true,
                services: true,
                address: true,
                paymentMethod: true,
            }
        });

        if (!partners) return res.status(500).json({ "error": "Unable To Get Partner" });

        return res.status(200).json({
            "message": "Partner Fetched Sucessfully", partner: partners
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Get Partner Internal Server Error" });
    }
}

export const partnersLogin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body

        console.log(phoneNumber, password);

        if (!phoneNumber || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const partners = await prisma.partners.findUnique({
            where: {
                phoneNumber: phoneNumber
            },
            select: {
                id: true,
                hospitalName: true,
                phoneNumber: true,
                email: true,
                password: true,
                address: {
                    select: {
                        id: true,
                        area: true,
                        landmark: true,
                        pincode: true,
                        state: true,
                        lat: true,
                        lng: true,
                    }
                },
                zone: {
                    select: {
                        id: true,
                        district: true,
                        state: true,
                        pincode: true
                    }
                }
            }
        })



        if (!partners) return res.status(404).json({ "error": "No User Exist" });

        if (!matchedPassword(password, partners.password)) return res.status(403).json({ "error": "Password Is Incorrect" });

        return res.status(200).json({
            "message": "LoggedIn Sucessfull", partner: {
                id: partners.id,
                address: partners.address,
                email: partners.email,
                phoneNumber: partners.phoneNumber,
                hospitalName: partners.hospitalName,
                zone: partners.zone
            }
        });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}


export const getForgotPasswordOtp = async (req, res) => {
    try {
        const { phoneNumber, type } = req.body;

        if (!phoneNumber || phoneNumber.length != 10) return res.status(400).json({ "error": "A Valid PhoneNumber Are Required" });

        const result = type == "partners" ? await prisma.partners.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        }) : await prisma.doctor.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        });

        if (!result) return res.status(404).json({ "error": "User Dosent Exist" });

        const isSent = await sentopt(phoneNumber);

        if (isSent.status != 200) return res.status(502).json({ "error": "Unable to sent OTP" });

        return res.status(200).json({ "message": "OTP sent Sucessfully", sessionId: isSent.sessionId });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to sent OTP Internal server error" });
    }
}

export const chagePassword = async (req, res) => {
    try {
        const { otp, password, phoneNumber, type } = req.body;

        if (otp.length != 6 || !password || !phoneNumber || !type) return res.status(400).json({ "error": "All Fields Are Required" });

        const isMatched = await verify2factorOtp(phoneNumber, otp)

        if (isMatched.status != 200) return res.status(400).json({ "error": "Invalid OTP" });

        const hasedPassword = generatePassword(password);

        let result;

        if (type == "partners") {
            result = await prisma.partners.update({
                where: {
                    phoneNumber: phoneNumber
                },
                data: {
                    password: hasedPassword
                }
            });
        } else {
            result = await prisma.doctor.update({
                where: {
                    phoneNumber: phoneNumber
                },
                data: {
                    password: hasedPassword
                }
            });
        }

        if (!result) return res.status(500).json({ "error": "Unable to Change Password" });
        return res.status(200).json({ "message": "Password chaged sucessfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Change Password internal server error" });
    }
}


export const uploadBanner = async (req, res) => {
    uploadPartnerBanner(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ error: err.message });
        }
        else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: "Internal Server Error" });
        }
        // Everything went fine.
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const imageUrl = req.files?.image ? req.files.image[0].filename : null;
        const result = await prisma.partners.update({
            where: {
                id: +req.params.id
            },
            data: {
                imageUrl: `${imageUrl}`
            }
        });
        return res.status(200).json({ message: "Image uploaded successfully", imageUrl: imageUrl });
    });
}

export const getBanner = async (req, res) => {
    try {
        const partner = await prisma.partners.findUnique({
            where: {
                id: +req.params.id
            },
            select: {
                imageUrl: true
            }
        });

        if (!partner) return res.status(404).json({ "error": "Partner Not Found" });

        return res.status(200).json({ "imageUrl": partner.imageUrl });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Retrieve Banner Internal Server Error" });
    }
}