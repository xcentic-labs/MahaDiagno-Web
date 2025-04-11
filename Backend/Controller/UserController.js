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

        if(!user) return res.status(500).json({"error" : "Unable to Update User"});
        return res.status(200).json({"message" : "User Updated Sucessfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({"error" : "Unable to Update User Internal server error"});
    }
}


export const verifyOtp = (req,res)=>{
    try {
        const {otp} = req.body

        if(!otp) return res.status(400).json({ "error": "All fields Are Required" });

        if(otp != '1234') return res.status(400).json({ "error": "Invalid OTP" });
        return res.status(200).json({ "message": "OTP Matched" });
    } catch (error) {
        return res.status(500).json({ "error": "Unable to process OTP internal server error" });
    }
}

export const getuser =async (req,res)=>{
    try {
        const id = req.params.id;

        if(!id) return res.status(400).json({"error": "All fields Are Required" });

        const user =  await prisma.user.findUnique({
            where : {
                id : +id
            }
        });

        if(!user) return res.status(404).json({"error": "User Not Found" });
        return res.status(200).json({"message": "User found"  ,  userData : user});
    } catch (error) {
        console.log(error);
        return res.status(404).json({"error": "Unable to get user Internal server error" }); 
    }
}