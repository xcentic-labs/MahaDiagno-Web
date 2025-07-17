import { generatePassword, matchedPassword } from "../Utils/password.js";
import prisma from "../Utils/prismaclint.js";
import { convertKeysToCamelCase } from "../Utils/camelCaseConverter.js";
import logError from "../Utils/log.js";

export const addServiceBoy = async (req, res) => {
    try {

        
        const { firstName, lastName, phoneNumber, email, password, partnerId, subscriptionId } = req.body

        if (!firstName || !lastName || !phoneNumber || !email || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        if (typeof (partnerId) != 'number' || typeof (subscriptionId) != 'number') return res.status(400).json({ "error": "Invalid Partner ID or Subscription Id" });

        const subscription = await prisma.subscription_purchase.findUnique({
            where: {
                id: +subscriptionId
            }
        })

        if (subscription.numberOfServiceBoyLeft <= 0) {
            return res.status(400).json({ error: "You have Exceed The Limit of Service Boy" });
        }

        const hasedPassword = generatePassword(password);

        const serviceBoy = await prisma.serviceboy.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                phoneNumber: phoneNumber,
                email: email,
                password: hasedPassword,
                partnerId: (+partnerId)
            }
        })

        await prisma.subscription_purchase.update({
            where: {
                id: +subscriptionId
            },
            data: {
                numberOfServiceBoyLeft: {
                    decrement: 1
                }
            }
        })

        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Add Service Boy" });
        return res.status(201).json({ "message": "Service Boy Added Sucessfully" });
    } catch (error) {
        logError(error);
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
        logError(error);
        return res.status(500).json({ "error": "Unable To Delete Service Boy Internal Server Error" });
    }
}

export const UpdatePassword = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const { oldPassword, newPassword } = req.body

        


        if (!oldPassword || !newPassword) return res.status(400).json({ "error": "All Fields Are Required" });


        const serviceBoy = await prisma.serviceboy.findUnique({
            where: {
                id: +id
            }
        })

        

        

        if (!matchedPassword(oldPassword, serviceBoy.password)) return res.status(403).json({ "error": "Old Password Is Incorrect" });

        const updatedServiceBoy = await prisma.serviceboy.update({
            where: {
                id: +id
            },
            data: {
                password: generatePassword(newPassword)
            }
        })

        if (!updatedServiceBoy) return res.status(500).json({ "error": "Unable To Update passwrod of Service Boy" });
        return res.status(200).json({ "message": "Password Updated Sucessfully" });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Update passwrod of Service Boy Internal Server Error" });
    }
}

export const serviceBoyLogin = async (req, res) => {
    try {
        
        const { phoneNumber, password } = req.body

        

        if (!phoneNumber || !password) return res.status(400).json({ "error": "All Fields Are Required" });

        const serviceBoy = await prisma.serviceboy.findUnique({
            where: {
                phoneNumber: phoneNumber
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                password: true,
                isActive: true,
                partner: {
                    select: {
                        id: true,
                        hospitalName: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        })

        

        if (!serviceBoy) return res.status(404).json({ "error": "No User Exist" });


        

        if (!matchedPassword(password, serviceBoy.password)) return res.status(403).json({ "error": "Password Is Incorrect" });

        

        return res.status(200).json({
            "message": "LoggedIn Sucessfull", serviceBoy: {
                id: serviceBoy.id,
                firstName: serviceBoy.first_name,
                lastName: serviceBoy.last_name,
                phoneNumber: serviceBoy.phoneNumber,
                email: serviceBoy.email,
                partner: serviceBoy.partner,
                isActive: serviceBoy.isActive
            }
        });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To LoogedIn Internal Server Error" });
    }
}

export const changeStatus = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) return res.status(400).json({ "error": "Id Is Required" });
        
        const { status } = req.body

        if (!(status == false || status == true)) return res.status(400).json({ "error": "Valdi Status Is Required" });

        const serviceBoy = await prisma.serviceboy.update({
            where: {
                id: +id
            },
            data: {
                status: status
            }
        })


        if (!serviceBoy) return res.status(404).json({ "error": "Service Boy Not Found" });

        return res.status(200).json({ "message": `Status Marked ${serviceBoy.status ? 'Online' : 'Offline'}`, status: serviceBoy.status });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Update the status" })
    }
}

export const getMyServiceBoy = async (req, res) => {
    try {
        const partnerid = req.params.partnerid

        if (!partnerid) return res.status(400).json({ "error": "Id Is Required" });

        const serviceBoy = await prisma.serviceboy.findMany({
            where: {
                partnerId: parseInt(partnerid)
            },
            orderBy: {
                status: 'desc'
            },
            select: {
                first_name: true,
                last_name: true,
                id: true,
                email: true,
                phoneNumber: true,
                status: true,
                appointment: {
                    include : {
                        serviceId : true
                    }
                },
            }
        });

        const formatedServiceBoy = serviceBoy.map((s) => {
            const completedAppointments = s.appointment.filter((app) => {
                return app.status == 'COMPLETED'
            });

            const acceptedAppointments = s.appointment.filter((app) => {
                return app.status == 'ACCEPTED'
            })

            const cashAppointments = s.appointment.filter((app) => {
                return app.modeOfPayment == 'cash' && app.isRecivesByPartner == false && app.isPaid == true
            });


            

            
            const totalMoney = cashAppointments.reduce((sum, app) => {
                return sum + (+app.serviceId?.price || 0);
            }, 0);



            return {
                id: s.id,
                email: s.email,
                firstName: s.first_name,
                lastName: s.last_name,
                phoneNumber: s.phoneNumber,
                status: s.status,
                completedAppointments: completedAppointments.length,
                acceptedAppointments: acceptedAppointments.length,
                totalAppointments: s.appointment.length,
                pendingMoney: totalMoney
            }
        })

        


        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Get ervice Boy" });
        return res.status(200).json({
            "message": "Service Boy Fetched Sucessfully", serviceBoy: formatedServiceBoy
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Get Service Boy Internal Server Error" });
    }
}

export const getAllServiceBoys = async (req, res) => {
    try {
        const serviceBoys = await prisma.serviceboy.findMany({
            include : {
                partner : true,
                _count : {
                    select : {
                        appointment : true
                    }
                }
            }
        })

        const allServiceBoy = serviceBoys.map((service)=> convertKeysToCamelCase(service) )

        if (!serviceBoys) return res.status(500).json({ "error": "Unable To Fetch Service Boys" });
        return res.status(200).json({ "message": "Service Boys Fetched Sucessfully", serviceBoys: allServiceBoy });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To FetchService Boy Internal Server Error" });
    }
}
// suppose to be chaged
export const getServiceBoy = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const serviceBoy = await prisma.serviceboy.findUnique({
            where: {
                id: +id
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                status: true,
                isActive: true,
                partner: {
                    select: {
                        id: true,
                        hospitalName: true,
                        email: true,
                        phoneNumber: true,
                        address: {
                            select: {
                                district: true,
                                pincode: true,
                                state: true
                            }
                        }
                    }
                }
            }
        });

        if (!serviceBoy) return res.status(500).json({ "error": "Unable To Get ervice Boy" });
        return res.status(200).json({
            "message": "Service Boy Fetched Sucessfully", serviceBoy: {
                id: serviceBoy.id,
                firstName: serviceBoy.first_name,
                lastName: serviceBoy.last_name,
                phoneNumber: serviceBoy.phoneNumber,
                email: serviceBoy.email,
                partner: serviceBoy.partner,
                status: serviceBoy.status,
                isActive: serviceBoy.isActive
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Get Service Boy Internal Server Error" });
    }
}


export const getSpecficServiceBoy = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ error: "Id is required" });

        const serviceBoy = await prisma.serviceboy.findUnique({
            where: {
                id: +id
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phoneNumber: true,
                status: true,
                partner: {
                    select: {
                        id: true,
                        hospitalName: true,
                        email: true,
                        phoneNumber: true,
                        address: {
                            select: {
                                district: true,
                                pincode: true,
                                state: true
                            }
                        }
                    }
                },
                appointment: {
                    select: {
                        id: true,
                        isPaid: true,
                        modeOfPayment: true,
                        status: true,
                        isRecivesByPartner : true,
                        serviceId: {
                            select: {
                                title: true,
                                price: true
                            }
                        }
                    }
                }

            }
        })


        if (!serviceBoy) return res.status(404).json({ error: "No Service Boy found with this ID" });

        const formatedServiceBoy = {
            id: serviceBoy.id,
            firstName: serviceBoy.first_name,
            lastName: serviceBoy.last_name,
            email: serviceBoy.email,
            phoneNumber: serviceBoy.phoneNumber,
            status: serviceBoy.status,
            partner: serviceBoy.partner,
            appointments: serviceBoy.appointment.map(appointment => ({
                id: appointment.id,
                isPaid: appointment.isPaid,
                modeOfPayment: appointment.modeOfPayment,
                status: appointment.status,
                isRecivesByPartner: appointment.isRecivesByPartner,
                service: appointment.serviceId,
                appointmentId: `MH2025D${appointment.id}`,
            })),
        };


        res.status(200).json({ "message": "service boy fetched Sucessfully", serviceboy: formatedServiceBoy });

    } catch (error) {
        logError(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const handleUpdateCashToRecived = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ error: "Id is required" });

        const appointments = await prisma.appointment.updateMany({
            where: {
                acceptedBy: +id,
                modeOfPayment: 'cash',
                isPaid: true
            },
            data: {
                isRecivesByPartner : true
            }
        });


        if (!appointments) return res.status(404).json({ error: "No Such appointements" });
        return res.status(200).json({ "message": "Status Updated Sucessfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}