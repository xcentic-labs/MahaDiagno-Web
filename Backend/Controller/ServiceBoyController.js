import { generatePassword, matchedPassword } from "../Utils/password.js";
import prisma from "../Utils/prismaclint.js";

export const addServiceBoy = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password, zoneId } = req.body

        if (!firstName || !lastName || !phoneNumber || !email || !password || !zoneId) return res.status(400).json({ "error": "All Fields Are Required" });

        const hasedPassword = generatePassword(password);

        const serviceBoy = await prisma.serviceboy.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                phoneNumber: phoneNumber,
                email: email,
                password: hasedPassword,
                zoneId: (+zoneId)
            }
        })

        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Add Service Boy" });
        return res.status(201).json({ "message": "Service Boy Added Sucessfully" });
    } catch (error) {
        console.log(error)
        if (error.code == 'P2002') {
            return res.status(409).json({ "error": "User Aleardy Exist" });
        }
        return res.status(500).json({ "error": "Unable To Add Service Boy Internal Server Error" });
    }
}

export const deleteServiceBoy = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const serviceBoy = await prisma.serviceboy.delete({
            where: {
                id: +id
            }
        })
        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Delete Service Boy" });
        return res.status(200).json({ "message": "Service Boy Deleted Sucessfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Delete Service Boy Internal Server Error" });
    }
}


export const getAllServiceBoys = async (req, res) => {
    try {
        const serviceBoys = await prisma.serviceboy.findMany({
            select : {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                zone : {
                    select : {
                        id : true,
                        state : true,
                        district : true,
                        pincode : true,   
                    }
                },
                _count : {
                    select : {
                        appointment : true
                    }
                }
            }
        })

        const allServiceBoy = serviceBoys.map((serviceBoy)=>{
            return {
                id : serviceBoy.id,
                firstName : serviceBoy.first_name,
                lastName : serviceBoy.last_name,
                email : serviceBoy.email,
                phoneNumber : serviceBoy.email,
                phoneNumber : serviceBoy.phoneNumber,
                zone : serviceBoy.zone,
                totalAppointments : serviceBoy._count.appointment
            }
        })

        if (!serviceBoys) return res.status(500).json({ "error": "Unable To Fetch Service Boys" });
        return res.status(200).json({ "message": "Service Boys Fetched Sucessfully", serviceBoys: allServiceBoy });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To FetchService Boy Internal Server Error" });
    }
}

export const getServiceBoy =async (req,res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const serviceBoy = await prisma.serviceboy.findUnique({
            where: {
                id: +id
            },
            select : {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                status : true,
                zone: {
                    select : {
                        id  : true,
                        state : true,
                        district : true,
                        pincode : true,   
                    }
                }
            }
        });

        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Get ervice Boy" });
        return res.status(200).json({ "message": "Service Boy Fetched Sucessfully" , serviceBoy : {
            id : serviceBoy.id,
            firstName : serviceBoy.first_name,
            lastName :  serviceBoy.last_name,
            phoneNumber : serviceBoy.phoneNumber,
            email : serviceBoy.email,
            zone : serviceBoy.zone,
            status : serviceBoy.status
        } });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Get Service Boy Internal Server Error" });
    }
}


export const UpdatePassword =async (req , res)=>{
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const { oldPassword , newPassword } = req.body

        console.log(req.body);


        if(!oldPassword || !newPassword ) return res.status(400).json({"error" : "All Fields Are Required"});


        const serviceBoy = await prisma.serviceboy.findUnique({
            where : {
                id  : +id
            }
        })

        console.log(serviceBoy);

        console.log(matchedPassword(oldPassword , serviceBoy.password));

        if(!matchedPassword(oldPassword , serviceBoy.password)) return res.status(403).json({"error" : "Old Password Is Incorrect"});

        const updatedServiceBoy = await prisma.serviceboy.update({
            where : {
                id : +id
            },
            data : {
                password : generatePassword(newPassword)
            }
        })

        if (!updatedServiceBoy) return res.status(500).json({ "error": "Unable To Update passwrod of Service Boy" });
        return res.status(200).json({ "message": "Password Updated Sucessfully" });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Update passwrod of Service Boy Internal Server Error" });
    }
}

export const serviceBoyLogin = async(req,res)=>{
    try {
        console.log(req.body)
        const {phoneNumber , password} = req.body

        if(!phoneNumber || !password) return res.status(400).json({"error" : "All Fields Are Required"});

        const serviceBoy = await prisma.serviceboy.findUnique({
            where : {
                phoneNumber : phoneNumber
            },
            select : {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                password : true,
                zone: {
                    select : {
                        id  : true,
                        state : true,
                        district : true,
                        pincode : true,   
                    }
                }
            }
        })

        if(!serviceBoy) return res.status(404).json({"error" : "No User Exist"});


        console.log(matchedPassword(password , serviceBoy.password));

        if(!matchedPassword(password , serviceBoy.password)) return res.status(403).json({"error" : "Password Is Incorrect"});

        return res.status(200).json({"message" : "LoggedIn Sucessfull" , serviceBoy : {
            id : serviceBoy.id,
            firstName : serviceBoy.first_name,
            lastName :  serviceBoy.last_name,
            phoneNumber : serviceBoy.phoneNumber,
            email : serviceBoy.email,
            zone : serviceBoy.zone
        }});

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}

export const changeStatus = async (req,res)=>{
    try {
        const id = req.params.id
        if (!id) return res.status(400).json({ "error": "Id Is Required" });
        console.log(req.body)
        const { status } = req.body 

        if (!(status == false || status == true)) return res.status(400).json({ "error": "Valdi Status Is Required" });

        const serviceBoy = await prisma.serviceboy.update({
            where : {
                id : +id
            },
            data : {
                status  : status
            }
        })


        if(!serviceBoy) return res.status(404).json({"error" : "Service Boy Not Found"});

        return res.status(200).json({"message" : `Status Marked ${serviceBoy.status ? 'Online' : 'Offline'}` , status : serviceBoy.status });
    } catch (error) {
        console.log(error);
        return res.status(500).json({"error" : "Unable to Update the status"})
    }
}