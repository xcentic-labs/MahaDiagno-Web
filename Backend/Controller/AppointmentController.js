import prisma from "../Utils/prismaclint.js";

export const addAppointment = async (req, res) => {
    try {
        const { patientFirstName, patientLastName, patientAge, gender, doctorName, AdditionalPhoneNumber, userId, serviceId, addressId } = req.body

        if (!patientFirstName || !patientLastName || !patientAge || !gender || !doctorName || !AdditionalPhoneNumber || !userId || !serviceId || !addressId) return res.status(400).json({ "error": "All Fields Are Required" });

        console.log(req.body)

        const appointment = await prisma.appointment.create({
            data: {
                patient_first_name: patientFirstName,
                patient_last_name: patientLastName,
                patient_age: patientAge,
                gender: gender,
                referring_doctor: doctorName,
                additional_phone_number: AdditionalPhoneNumber,
                userId: +userId,
                service_id: +serviceId,
                addressId: +addressId,
            },
        });


        console.log(appointment);

        if (!appointment) return res.status(500).json({ "error": "Unable to Add Appointment" });
        return res.status(201).json({ "message": "Appointment Added Sucessfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Add Appointment Internal Server Error" });
    }
}

export const acceptAppointment = async (req, res) => {
    try {
        const { serviceBoyId, appointmentId } = req.body
        if (!serviceBoyId, !appointmentId) return res.status(400).json({ "error": "Service Boy ID And Appointment Id is required" });

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId
            },
            data: {
                acceptedBy: serviceBoyId,
                status: 'ACCEPTED'
            },
            select: {
                patient_first_name: true,
                patient_last_name: true,
                patient_age: true,
                gender: true,
                referring_doctor: true,
                additional_phone_number: true,
                userId: true,
                service_id: true,
                addressId: true,
                status: true,
                createdAt: true,
                booked_by: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                },
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        banner_url: true
                    }
                },
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
                }
            }
        });

        const formattedAppointment = {
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            bookedBy: {
                firstName: appointment.booked_by.first_name,
                lastName: appointment.booked_by.last_name,
                phoneNumber: appointment.booked_by.phoneNumber
            },
            service: {
                title: appointment.serviceId.title,
                price: appointment.serviceId.price,
                bannerUrl: appointment.serviceId.banner_url
            },
            address: {
                area: appointment.address.area,
                landmark: appointment.address.landmark,
                pincode: appointment.address.pincode,
                district: appointment.address.district,
                state: appointment.address.state,
                lat: appointment.address.lat,
                lng: appointment.address.lng
            }
        };

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

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId,
                acceptedBy: serviceBoyId,
            },
            data: {
                status: 'COMPLETED'
            },
            select: {
                patient_first_name: true,
                patient_last_name: true,
                patient_age: true,
                gender: true,
                referring_doctor: true,
                additional_phone_number: true,
                userId: true,
                service_id: true,
                addressId: true,
                status: true,
                createdAt: true,
                booked_by: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                },
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        banner_url: true
                    }
                },
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
                }
            }
        });

        const formattedAppointment = {
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            bookedBy: {
                firstName: appointment.booked_by.first_name,
                lastName: appointment.booked_by.last_name,
                phoneNumber: appointment.booked_by.phoneNumber
            },
            service: {
                title: appointment.serviceId.title,
                price: appointment.serviceId.price,
                bannerUrl: appointment.serviceId.banner_url
            },
            address: {
                area: appointment.address.area,
                landmark: appointment.address.landmark,
                pincode: appointment.address.pincode,
                district: appointment.address.district,
                state: appointment.address.state,
                lat: appointment.address.lat,
                lng: appointment.address.lng
            }
        };

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

        const appointment = await prisma.appointment.update({
            where: {
                id: +appointmentId,
            },
            data: {
                status: 'CANCELLED',
                acceptedBy: serviceBoyId,
            },
            select: {
                patient_first_name: true,
                patient_last_name: true,
                patient_age: true,
                gender: true,
                referring_doctor: true,
                additional_phone_number: true,
                userId: true,
                service_id: true,
                addressId: true,
                status: true,
                createdAt: true,
                booked_by: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                },
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        banner_url: true
                    }
                },
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
                }
            }
        });

        const formattedAppointment = {
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            bookedBy: {
                firstName: appointment.booked_by.first_name,
                lastName: appointment.booked_by.last_name,
                phoneNumber: appointment.booked_by.phoneNumber
            },
            service: {
                title: appointment.serviceId.title,
                price: appointment.serviceId.price,
                bannerUrl: appointment.serviceId.banner_url
            },
            address: {
                area: appointment.address.area,
                landmark: appointment.address.landmark,
                pincode: appointment.address.pincode,
                district: appointment.address.district,
                state: appointment.address.state,
                lat: appointment.address.lat,
                lng: appointment.address.lng
            }
        };


        if (!appointment) return res.status(404).json({ "error": "Internal server error" });
        return res.status(200).json({ "message": "Appointment Canclled Sucessfully", appointment: formattedAppointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Complete Internal server error" })
    }
}

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

export const getAllAppointments = async (req, res) => {
    try {
        const allAppointments = await prisma.appointment.findMany({});

        if (!allAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });
        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", allAppointments: allAppointments });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}


export const getPersonalAppointments = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "Id Is Required" });
        }

        const matchedCondition = {
            userId: +id,
        }


        if (req.query.status) {
            matchedCondition.status = (req.query.status).toUpperCase();
        }


        const myAppointments = await prisma.appointment.findMany({
            where: matchedCondition,
            select: {
                patient_first_name: true,
                patient_last_name: true,
                patient_age: true,
                gender: true,
                referring_doctor: true,
                additional_phone_number: true,
                userId: true,
                service_id: true,
                addressId: true,
                status: true,
                createdAt: true,
                // Related: User info
                booked_by: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                },
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
        });

        if (!myAppointments) {
            return res.status(500).json({ error: "Unable To Fetch Appointments" });
        }

        // Map to rename fields as required
        const formattedAppointments = myAppointments.map(appointment => ({
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            doctorName: appointment.referring_doctor,
            AdditionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            status: appointment.status,
            createdAt: appointment.createdAt,

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
                firstName: appointment.booked_by.first_name,
                lastName: appointment.booked_by.last_name,
                phoneNumber: appointment.booked_by.phoneNumber
            },

            // Service Boy Info (if assigned)
            serviceBoy: appointment.serviceBoy ? {
                firstName: appointment.serviceBoy.first_name,
                lastName: appointment.serviceBoy.last_name,
                phoneNumber: appointment.serviceBoy.phoneNumber,
                email: appointment.serviceBoy.email
            } : null
        }));

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
                id: true
            }
        });


        if (!myAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });

        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", myAppointments: myAppointments });
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
                id: true
            }
        });


        if (!myAppointments) return res.status(500).json({ "error": "Unable To Fetch Appointments" });

        return res.status(200).json({ "message": "Appointments Fetched Sucessfully", myAppointments: myAppointments });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable To Fetch Appointments Internal Server Error" });
    }
}

export const getSpecificAppointment = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ error: "Id is required" });

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: +id
            },
            select: {
                patient_first_name: true,
                patient_last_name: true,
                patient_age: true,
                gender: true,
                referring_doctor: true,
                additional_phone_number: true,
                userId: true,
                service_id: true,
                addressId: true,
                status: true,
                createdAt: true,
                booked_by: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phoneNumber: true
                    }
                },
                serviceId: {
                    select: {
                        title: true,
                        price: true,
                        banner_url: true
                    }
                },
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
                }
            }
        });

        if (!appointment) return res.status(404).json({ error: "No appointment found with this ID" });

        // Map snake_case fields to camelCase
        const formattedAppointment = {
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            bookedBy: {
                firstName: appointment.booked_by.first_name,
                lastName: appointment.booked_by.last_name,
                phoneNumber: appointment.booked_by.phoneNumber
            },
            service: {
                title: appointment.serviceId.title,
                price: appointment.serviceId.price,
                bannerUrl: appointment.serviceId.banner_url
            },
            address: {
                area: appointment.address.area,
                landmark: appointment.address.landmark,
                pincode: appointment.address.pincode,
                district: appointment.address.district,
                state: appointment.address.state,
                lat: appointment.address.lat,
                lng: appointment.address.lng
            }
        };

        return res.status(200).json({
            message: "Appointment fetched successfully",
            appointment: formattedAppointment
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
