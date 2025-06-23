import prisma from "../Utils/prismaclint.js";
import { uploadReportFile } from '../Storage/ReportRouter.js';
import { generateFormatedRes, fieldToBeSelected } from "../Utils/GenerateFormatedRes.js";
import { convertKeysToCamelCase } from "../Utils/camelCaseConverter.js";


export const deleteAppointment = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const appointment = await prisma.appointment.delete({
            where: {
                id: +id
            }
        })

        if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
        return res.status(200).json({ "message": "Appointment Deleted Sucessfully" });
    } catch (error) {
        return res.status(500).json({ "error": "Unable to Deleted Appointment Internal Server Error" });
    }
} // no

export const getPersonalAppointments = async (req, res) => {
    try {
        const id = req.params.id;

        console.log(req.params.id)
        const matchedCondition = {}

        if (!id) {
            return res.status(400).json({ error: "Id Is Required" });
        }


        if (req.query.status) {
            matchedCondition.status = (req.query.status).toUpperCase();
        }


        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            include: {
                partner: true,
                serviceId: true,
                serviceBoy: true,
                address: true
            }
        });

        const formattedAppointments = myAppointments.map((app) => {
            console.log(app.id)
            return { ...convertKeysToCamelCase(app), appointementId: `MH2025D${app.id}` }
        })

        if (!myAppointments) {
            return res.status(500).json({ error: "Unable To Fetch Appointments" });
        }



        return res.status(200).json({
            message: "Appointments Fetched Successfully",
            myAppointments: formattedAppointments
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
} // nos

export const getPartnerAppointments = async (req, res) => {
    try {
        const id = req.params.id;

        console.log(req.params.id)
        const matchedCondition = {
            partnerId : +id
        }

        if (!id) {
            return res.status(400).json({ error: "Id Is Required" });
        }


        if (req.query.status != 'all') {
            matchedCondition.status = (req.query.status).toUpperCase();
        }

        if (req.query.status == 'report') {
            matchedCondition.status = 'COMPLETED'
            matchedCondition.isReportUploaded = false
        }
        

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            include: {
                serviceId: true,
                serviceBoy: {
                    select : {
                        id : true,
                        first_name : true,
                        last_name : true,
                        phoneNumber : true,
                        email : true,
                        partnerId: true
                    }
                },
                address: true,
                booked_by_user : true
            }
        });

        const formattedAppointments = myAppointments.map((app) => {
            return { ...convertKeysToCamelCase(app), appointementId: `MH2025D${app.id}` }
        })

        if (!myAppointments) {
            return res.status(500).json({ error: "Unable To Fetch Appointments" });
        }



        return res.status(200).json({
            message: "Appointments Fetched Successfully",
            myAppointments: formattedAppointments
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}


export const serviceBoyAppointments = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        console.log(req.query.status);

        const matchedCondition = {
            acceptedBy: +id
        }

        if (req.query.status != 'all') {
            matchedCondition.status = (req.query.status).toUpperCase()
        }

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            include : {
                booked_by_user : true,
                serviceId : true,
                address : true
            },
        });

        const appointments = myAppointments.map(appointment => ({
             ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }));

        console.log(appointments)


        if (!myAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });

        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", myAppointments: appointments });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}

export const getAppointments = async (req, res) => {
    try {

        const matchedCondition = {}

        if (req.query.status != 'all') {
            matchedCondition.status = (req.query.status).toUpperCase()
        }

        console.log(req.query);

        if (!req.query?.partnerid) return res.status(400).json({ "error": "Partner Id is Required" });


        matchedCondition.partnerId = +(req.query?.partnerid)

        console.log(matchedCondition);

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            include : {
                booked_by_user : true,
                serviceId : true,
                address : true
            },
        });

        const appointments = myAppointments.map(appointment => {
            return { ...convertKeysToCamelCase(appointment), appointementId: `MH2025D${appointment.id}` }
        });

        // console.log(appointments);



        if (!appointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });

        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", myAppointments: appointments });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}











export const getSpecificAppointment = async (req, res) => {
    try {
        const id = req.params.id;

        console.log(req.params.id)

        if (!id) return res.status(400).json({ error: "Id is required" });


        const appointment = await prisma.appointment.findUnique({
            where: {
                id: +id
            },
            select: fieldToBeSelected
        });

        if (!appointment) return res.status(404).json({ error: "No appointment found with this ID" });

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

        return res.status(200).json({
            message: "Appointment fetched successfully",
            appointment: formattedAppointment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getAllAppointments = async (req, res) => {
    try {
        const matchedCondition = {}

    


        if (req.query.status != 'all') {
            matchedCondition.status = (req.query.status).toUpperCase();
        }

        if (req.query.status == 'report') {
            matchedCondition.status = 'COMPLETED'
            matchedCondition.isReportUploaded = false
        }
        

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            include: {
                serviceId: {
                    include : {
                        partner : true
                    }
                },
                serviceBoy: {
                    select : {
                        id : true,
                        first_name : true,
                        last_name : true,
                        phoneNumber : true,
                        email : true,
                        partnerId: true
                    }
                },
                address: true,
                booked_by_user : true
            }
        });

        const formattedAppointments = myAppointments.map((app) => {
            return { ...convertKeysToCamelCase(app), appointementId: `MH2025D${app.id}` }
        })

        if (!myAppointments) {
            return res.status(500).json({ error: "Unable To Fetch Appointments" });
        }



        return res.status(200).json({
            message: "Appointments Fetched Successfully",
            myAppointments: formattedAppointments
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}



export const acceptAppointment = async (req, res) => {
    try {
        const { serviceBoyId, appointmentId } = req.body
        if (!serviceBoyId, !appointmentId) return res.status(400).json({ "error": "Service Boy ID And Appointment Id is required" });


        console.log(req.body);

        if (req.query.usertype == 'partner') {
            fieldToBeSelected.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true
                }
            };
        } else {
            fieldToBeSelected.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true
                }
            };
        }

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId,
                status: 'SCHEDULED'
            },
            data: {
                acceptedBy: serviceBoyId,
                status: 'ACCEPTED'
            },
            select: fieldToBeSelected
        });


        console.log(appointment);

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

        if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
        return res.status(200).json({ "message": "Appointment Accepted Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Accept Internal server error" })
    }
}

export const completeAppointment = async (req, res) => {
    try {
        const { serviceBoyId, appointmentId } = req.body
        if (!serviceBoyId, !appointmentId) return res.status(400).json({ "error": "Service Boy ID And Appointment Id is required" });


        if (req.query.usertype == 'partner') {
            fieldToBeSelected.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true
                }
            };
        } else {
            fieldToBeSelected.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true
                }
            };
        }


        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId,
                acceptedBy: serviceBoyId,
            },
            data: {
                status: 'COMPLETED'
            },
            select: fieldToBeSelected
        });

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

        if (!appointment) return res.status(404).json({ "error": "Internal server error" });
        return res.status(200).json({ "message": "Appointment COMPLETED Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Complete Internal server error" })
    }
}

export const cancleAppointment = async (req, res) => {
    try {
        const { serviceBoyId, appointmentId } = req.body
        console.log(serviceBoyId, appointmentId);
        if (!serviceBoyId, !appointmentId) return res.status(400).json({ "error": "Service Boy ID And Appointment Id is required" });

        if (req.query.usertype == 'partner') {
            fieldToBeSelected.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true
                }
            };
        } else {
            fieldToBeSelected.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true
                }
            };
        }

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId,
            },
            data: {
                status: 'CANCELLED',
                acceptedBy: serviceBoyId,
            },
            select: fieldToBeSelected
        });

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }


        if (!appointment) return res.status(404).json({ "error": "Internal server error" });
        return res.status(200).json({ "message": "Appointment Canclled Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Complete Internal server error" })
    }
}

//  chage status 
export const updateStatus = async (req, res) => {
    try {
        const { status, appointmentId } = req.body
        if (!status, !appointmentId) return res.status(400).json({ "error": "Service Boy ID And Appointment Id is required" });





        if (!(status == 'SCHEDULED' || status == 'ACCEPTED' || status == 'COMPLETED' || status == 'CANCELLED')) {
            return res.status(400).json({ "error": "Inavali Status Value" });
        }


        if (req.query.usertype == 'partner') {
            fieldToBeSelected.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true
                }
            };
        } else {
            fieldToBeSelected.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true
                }
            };
        }

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId
            },
            data: {
                status: status
            },
            select: fieldToBeSelected
        });

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

        if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
        return res.status(200).json({ "message": "Appointment Accepted Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Accept Internal server error" })
    }
}


export const uploadReport = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ error: "Id is required" });



        const result = uploadReportFile.single("report")(req, res, async (err) => {
            if (err) {
                if (err) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: "File too large. Max size is 5MB." });
                    }
                    return res.status(400).json({ error: err.message });
                }
                return res.status(400).json({ error: err.message });
            }

            if (req.query.usertype == 'partner') {
                fieldToBeSelected.booked_by_partner = {
                    select: {
                        hospitalName: true,
                        phoneNumber: true
                    }
                };
            } else {
                fieldToBeSelected.booked_by_user = {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                };
            }

            const appointment = await prisma.appointment.update({
                where: {
                    id: +id
                },
                data: {
                    isReportUploaded: true,
                    reportName: req.file.filename,
                },
                select: fieldToBeSelected
            });

            const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

            if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
            return res.status(200).json({ "message": "PDF Uploded Sucessfully", appointment: formattedAppointment });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Accept Internal server error" })
    }
}



export const handleMarkAsPaid = async (req, res) => {
    try {
        const { appointmentId } = req.body
        if (!appointmentId) return res.status(400).json({ "error": "Appointment Id is required" });

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId
            },
            data: {
                isPaid: true
            },
            select: fieldToBeSelected
        });

        const formattedAppointment = {
            ...convertKeysToCamelCase(appointment),
            appointementId: `MH2025D${appointment.id}`
        }

        if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
        return res.status(200).json({ "message": "Appointment Accepted Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Accept Internal server error" })
    }
}