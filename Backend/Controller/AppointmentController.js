import prisma from "../Utils/prismaclint.js";
import { uploadReportFile } from '../Storage/ReportRouter.js';
import { generateFormatedRes, fieldToBeSelected } from "../Utils/GenerateFormatedRes.js";


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
}

export const getPersonalAppointments = async (req, res) => {
    try {
        const id = req.params.id;
        const matchedCondition = {}
        const select = {
            id: true,
            patient_first_name: true,
            patient_last_name: true,
            patient_age: true,
            gender: true,
            referring_doctor: true,
            additional_phone_number: true,
            userId: true,
            partnerId: true,
            IsSubscriptionBased: true,
            service_id: true,
            addressId: true,
            status: true,
            createdAt: true,
            isReportUploaded: true,
            reportName: true,
            isPaid: true,
            modeOfPayment: true,
            // Related: Service info
            serviceId: {
                select: {
                    title: true,
                    price: true,
                    banner_url: true
                }
            },
            // Related: Address info
            address: {
                select: {
                    area: true,
                    landmark: true,
                    pincode: true,
                    district: true,
                    state: true,
                    lat: true,
                    lng: true
                }
            },
            // Related: ServiceBoy info (optional)
            serviceBoy: {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true,
                    email: true
                }
            }
        }

        if (!id) {
            return res.status(400).json({ error: "Id Is Required" });
        }


        if (req.query.usertype == 'partner') {
            select.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true
                }
            }

            matchedCondition.partnerId = +id

        } else {
            select.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true
                }
            }
            matchedCondition.userId = +id
        }


        if (req.query.status) {
            matchedCondition.status = (req.query.status).toUpperCase();
        }


        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            select: select
        });

        if (!myAppointments) {
            return res.status(500).json({ error: "Unable To Fetch Appointments" });
        }

        // Map to rename fields as required
        const formattedAppointments = myAppointments.map(appointment => {
            return req.query.usertype == 'partner' ?
                {
                    id: appointment.id,
                    patientFirstName: appointment.patient_first_name,
                    patientLastName: appointment.patient_last_name,
                    patientAge: appointment.patient_age,
                    gender: appointment.gender,
                    doctorName: appointment.referring_doctor,
                    AdditionalPhoneNumber: appointment.additional_phone_number,
                    userId: appointment.userId,
                    partnerId: appointment.partnerId,
                    IsSubscriptionBased: appointment.IsSubscriptionBased,
                    status: appointment.status,
                    createdAt: appointment.createdAt,
                    isReportUploaded: appointment.isReportUploaded,
                    reportName: appointment.reportName,
                    appointementId: `MH2025D${appointment.id}`,
                    isPaid: appointment.isPaid,
                    modeOfPayment: appointment.modeOfPayment,
                    // Service Info
                    service: {
                        serviceId: appointment.service_id,
                        title: appointment.serviceId.title,
                        price: appointment.serviceId.price,
                        bannerUrl: appointment.serviceId.banner_url
                    },

                    // Address Info
                    address: {
                        addressId: appointment.addressId,
                        area: appointment.address.area,
                        landmark: appointment.address.landmark,
                        pincode: appointment.address.pincode,
                        district: appointment.address.district,
                        state: appointment.address.state,
                        lat: appointment.address.lat,
                        lng: appointment.address.lng
                    },
                    // Booked By User Info
                    bookedBy: {
                        hospitalName: appointment.booked_by_partner.hospitalName,
                        phoneNumber: appointment.booked_by_partner.phoneNumber
                    },
                    // Service Boy Info (if assigned)
                    serviceBoy: appointment.serviceBoy ? {
                        firstName: appointment.serviceBoy.first_name,
                        lastName: appointment.serviceBoy.last_name,
                        phoneNumber: appointment.serviceBoy.phoneNumber,
                        email: appointment.serviceBoy.email
                    } : null
                }
                :
                {
                    id: appointment.id,
                    patientFirstName: appointment.patient_first_name,
                    patientLastName: appointment.patient_last_name,
                    patientAge: appointment.patient_age,
                    gender: appointment.gender,
                    doctorName: appointment.referring_doctor,
                    AdditionalPhoneNumber: appointment.additional_phone_number,
                    userId: appointment.userId,
                    partnerId: appointment.partnerId,
                    IsSubscriptionBased: appointment.IsSubscriptionBased,
                    status: appointment.status,
                    createdAt: appointment.createdAt,
                    isReportUploaded: appointment.isReportUploaded,
                    reportName: appointment.reportName,
                    appointementId: `MH2025D${appointment.id}`,
                    isPaid: appointment.isPaid,
                    modeOfPayment: appointment.modeOfPayment,
                    // Service Info
                    service: {
                        serviceId: appointment.service_id,
                        title: appointment.serviceId.title,
                        price: appointment.serviceId.price,
                        bannerUrl: appointment.serviceId.banner_url
                    },

                    // Address Info
                    address: {
                        addressId: appointment.addressId,
                        area: appointment.address.area,
                        landmark: appointment.address.landmark,
                        pincode: appointment.address.pincode,
                        district: appointment.address.district,
                        state: appointment.address.state,
                        lat: appointment.address.lat,
                        lng: appointment.address.lng
                    },
                    // Booked By User Info
                    bookedBy: {
                        firstName: appointment.booked_by_user.first_name,
                        lastName: appointment.booked_by_user.last_name,
                        phoneNumber: appointment.booked_by_user.phoneNumber
                    },
                    // Service Boy Info (if assigned)
                    serviceBoy: appointment.serviceBoy ? {
                        firstName: appointment.serviceBoy.first_name,
                        lastName: appointment.serviceBoy.last_name,
                        phoneNumber: appointment.serviceBoy.phoneNumber,
                        email: appointment.serviceBoy.email
                    } : null
                }
        });

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
            select: {
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        id: true
                    }
                },
                address: {
                    select: {
                        state: true,
                        area: true,
                        district: true,
                        landmark: true
                    }
                },
                status: true,
                createdAt: true,
                id: true,
                IsSubscriptionBased : true
            },
        });

        const appointments = myAppointments.map(appointment => ({
            ...appointment,
            appointmentId: `MH2025D${appointment.id}`
        }));


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

        if (!req.query?.zone) return res.status(400).json({ "error": "Service Boy Zone is Required" });


        matchedCondition.address = {
            pincode: req.query?.zone
        }

        console.log(matchedCondition);

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            select: {
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        id: true
                    }
                },
                address: {
                    select: {
                        state: true,
                        area: true,
                        district: true,
                        landmark: true
                    }
                },
                status: true,
                createdAt: true,
                id: true,
                isPaid: true,
                IsSubscriptionBased : true
            }
        });

        const appointments = myAppointments.map(appointment => ({
            ...appointment,
            appointmentId: `MH2025D${appointment.id}`
        }));





        if (!myAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });

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

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: +id
            },
            select: fieldToBeSelected
        });

        if (!appointment) return res.status(404).json({ error: "No appointment found with this ID" });

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

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
        const select = {
            serviceId: {
                select: {
                    title: true,
                    price: true,
                    id: true
                }
            },
            address: {
                select: {
                    state: true,
                    area: true,
                    district: true,
                    landmark: true
                }
            },
            status: true,
            createdAt: true,
            id: true,
            isPaid: true,

        }

        if (req?.query?.usertype == 'partner') {
            matchedCondition.userId = null
            select.booked_by_partner = {
                select: {
                    hospitalName: true,
                    phoneNumber: true,
                    email: true
                }
            }
        } else {
            matchedCondition.partnerId = null
            select.booked_by_user = {
                select: {
                    first_name: true,
                    last_name: true,
                    phoneNumber: true,
                    email: true
                }
            }
        }

        if (req.query.status != 'all') {
            matchedCondition.status = (req.query.status).toUpperCase()
        }

        if (req.query?.include == 'reports') {
            matchedCondition.isReportUploaded = false
        }

        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            select: select
        });


        const allAppointments = myAppointments.map((appt) => {
            return req.query.usertype == 'partner' ?
                {
                    id: appt.id,
                    status: appt.status,
                    createdAt: appt.createdAt,
                    appointementId: `MH2025D${appt.id}`,
                    service: {
                        id: appt.serviceId?.id,
                        title: appt.serviceId?.title,
                        price: appt.serviceId?.price,
                    },
                    address: {
                        state: appt.address?.state,
                        area: appt.address?.area,
                        district: appt.address?.district,
                        landmark: appt.address?.landmark,
                    },
                    bookedBy: {
                        hospitalName: appt.booked_by_partner?.hospitalName,
                        phoneNumber: appt.booked_by_partner?.phoneNumber,
                        email: appt.booked_by_partner?.email,
                    }
                }
                :
                {
                    id: appt.id,
                    status: appt.status,
                    createdAt: appt.createdAt,
                    appointementId: `MH2025D${appt.id}`,
                    service: {
                        id: appt.serviceId?.id,
                        title: appt.serviceId?.title,
                        price: appt.serviceId?.price,
                    },
                    address: {
                        state: appt.address?.state,
                        area: appt.address?.area,
                        district: appt.address?.district,
                        landmark: appt.address?.landmark,
                    },
                    bookedBy: {
                        firstName: appt.booked_by_user?.first_name,
                        lastName: appt.booked_by_user?.last_name,
                        phoneNumber: appt.booked_by_user?.phoneNumber,
                        email: appt.booked_by_user?.email,
                    }
                }

        });


        if (!myAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });
        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", allAppointments: allAppointments });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}



export const acceptAppointment = async (req, res) => {
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
                status: 'SCHEDULED'
            },
            data: {
                acceptedBy: serviceBoyId,
                status: 'ACCEPTED'
            },
            select: fieldToBeSelected
        });

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

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

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

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

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);


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

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

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



        const result = uploadReportFile.single("file")(req, res, async (err) => {
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

            const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

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

        const formattedAppointment = req.query.usertype == 'partner' ? generateFormatedRes(appointment, 'partner') : generateFormatedRes(appointment);

        if (!appointment) return res.status(404).json({ "error": "Appointment Not Found" });
        return res.status(200).json({ "message": "Appointment Accepted Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Accept Internal server error" })
    }
}