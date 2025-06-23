import prisma from "../Utils/prismaclint.js";
import { generatePassword, matchedPassword } from "../Utils/password.js";
import { sentopt, verify2factorOtp } from "../Utils/otp.js";


export const createPartnersAccount = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password, addressId , zoneId } = req.body

        console.log(req.body)

        console.log(req.body)
        if (!hospitalName || !phoneNumber || !email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const hasedPassword = generatePassword(password);

        const partners = await prisma.partners.create({
            data: {
                hospitalName: hospitalName,
                email: email,
                phoneNumber: phoneNumber,
                password: hasedPassword,
                addressId: addressId,
                zoneId : zoneId
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
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: "Id is required" });

        // Check if partner exists
        const existingPartner = await prisma.partners.findUnique({ where: { id : +id } });
        if (!existingPartner) return res.status(404).json({ error: "Partner not found" });

        // Delete dependent records in correct order
        await prisma.appointment.deleteMany({ where: { partnerId : +id } });
        await prisma.serviceboy.deleteMany({ where: { partnerId : +id } });
        await prisma.services.deleteMany({ where: { partnerId : +id } });
        await prisma.subscription_purchase.deleteMany({ where: {  partnersId : +id} });

        // Delete the partner
        await prisma.partners.delete({ where: { id : +id } });

        return res.status(200).json({ message: "Partner and related data deleted successfully" });
    } catch (error) {
        console.error(error);
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
                isSubscribed : true,
                _count: {
                    select: {
                        subscription_purchase: true,
                        serviceBoy : true,
                        appointment : true,
                        services : true
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
            include : {
                subscription_purchase : true,
                serviceBoy : true,
                appointment : true,
                services : true,
                address : true
            }
        });

        if (!partners) return res.status(500).json({ "error": "Unable To Get Partner" });
        console.log(partners);
        return res.status(200).json({
            "message": "Partner Fetched Sucessfully", partner: partners
        });
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
                zone : {
                    select : {
                        id : true,
                        district : true,
                        state :true,
                        pincode : true
                    }
                }
            }
        })

        console.log(partners)

        if (!partners) return res.status(404).json({ "error": "No User Exist" });

        if (!matchedPassword(password, partners.password)) return res.status(403).json({ "error": "Password Is Incorrect" });

        return res.status(200).json({
            "message": "LoggedIn Sucessfull", partner: {
                id: partners.id,
                address: partners.address,
                email: partners.email,
                phoneNumber: partners.phoneNumber,
                hospitalName: partners.hospitalName,
                zone : partners.zone
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}


export const getForgotPasswordOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.length != 10) return res.status(400).json({ "error": "A Valid PhoneNumber Are Required" });

        const result = await prisma.partners.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        })

        if (!result) return res.status(404).json({ "error": "User Dosent Exist" });

        const isSent = await sentopt(phoneNumber);

        if (isSent.status != 200) return res.status(502).json({ "error": "Unable to sent OTP" });

        return res.status(200).json({ "message": "OTP sent Sucessfully", sessionId: isSent.sessionId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to sent OTP Internal server error" });
    }
}

export const chagePassword = async (req, res)=>{
    try {
        const {otp , password , phoneNumber} = req.body;

        console.log(req.body);

        if(otp.length != 6 || !password || !phoneNumber) return res.status(400).json({ "error": "All Fields Are Required" });

        const isMatched = await verify2factorOtp(phoneNumber , otp)

        if(isMatched.status != 200) return res.status(400).json({ "error": "Invalid OTP" });

        const hasedPassword = generatePassword(password);

        const result = await prisma.partners.update({
            where : {
                phoneNumber : phoneNumber
            },
            data :{
                password : hasedPassword
            }
        });

        if (!result) return res.status(500).json({ "error": "Unable to Change Password"});
        return res.status(200).json({ "message": "Password chaged sucessfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Change Password internal server error" });
    }
}