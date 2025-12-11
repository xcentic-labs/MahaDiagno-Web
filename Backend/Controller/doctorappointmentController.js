import prisma from "../Utils/prismaclint.js";
import crypto from 'crypto'
import Razorpay from "razorpay";
import { uploadPrescriptionImage } from "../Storage/prescription.js";

const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

export const createOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt,
        });

        return res.status(200).json(order);
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: 'Failed to create order', details: err });
    }
}

export const addAppointment = async (req, res) => {
    const { patientFirstName, patientLastName, patientAge, patientGender, patientPhoneNumber, userId, doctorId, slotId, date } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("Received appointment data:", req.body);


    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ "error": "Payment Details Are Missing" });

    // Validate required fields
    if (!patientFirstName || !patientLastName || !patientAge || !patientGender || !patientPhoneNumber || !userId || !doctorId  || !slotId || !date) {
        return res.status(400).json({ error: "All fields are required" });
    }


    const hmac = crypto.createHmac('sha256', razorpay.key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');


    if (generated_signature != razorpay_signature) {
        return res.status(400).json({ "error": "Invalid Payment Signature" });
    }

    try {
        const appointment = await prisma.doctorappointment.create({
            data: {
                patientFirstName,
                patientLastName,
                patientAge,
                patientGender,
                patientPhoneNumber,
                userId: Number(userId),
                doctorId: Number(doctorId),
                slotId: Number(slotId),
                date,
                rpzOrderId: razorpay_order_id,
                rpzPaymentId: razorpay_payment_id,
            }
        });

        console.log("Appointment created successfully:", appointment);

        return res.status(201).json(appointment);
    } catch (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// only user can cancle appointment
export const cancelAppointment = async (req, res) => {
    const { appointmentId, userId } = req.params;

    console.log("Cancelling appointment with ID:", appointmentId, "for user ID:", userId);

    // Validate required fields
    if (!appointmentId || !userId) {
        return res.status(400).json({ error: "Appointment ID and User ID are required" });
    }

    try {

        const appointment = await prisma.doctorappointment.findUnique({
            where: {
                id: Number(appointmentId),
                userId: Number(userId)
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }


        const order = await razorpay.orders.fetch(appointment.rpzOrderId);


        console.log("Fetched order details:", order);


        // refunding amount
        const refundAmount = (+order.amount / 100) - (0.02 * (+order.amount / 100) + (0.18 * (0.02 * (+order.amount / 100))));

        console.log("Calculated refund amount:", refundAmount);

        const refund = await razorpay.payments.refund(appointment.rpzPaymentId, {
            amount: refundAmount * 100,
            speed: 'normal',
        });

        console.log("Refund processed:", refund);

        if (!refund) {
            return res.status(400).json({ error: "Refund failed" });
        }

        const updatedAppointment = await prisma.doctorappointment.update({
            where: {
                id: Number(appointmentId),
                userId: Number(userId),
                status: "SCHEDULED" // Ensure only scheduled appointments can be cancelled
            },
            data: {
                status: "CANCELLED",
                rpzRefundPaymentId: refund.id
            }
        });



        if (!updatedAppointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment cancelled successfully", updatedAppointment });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const acceptAppointment = async (req, res) => {
    const { appointmentId, doctorId } = req.params;
    // const { videoCallId } = req.body

    // if(!videoCallId){
    //     return res.status(400).json({ error: "Video Call ID is required" });
    // }

    // Validate required fields
    if (!appointmentId || !doctorId) {
        return res.status(400).json({ error: "Appointment ID and Doctor ID are required" });
    }



    try {
        const appointment = await prisma.doctorappointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: Number(doctorId),
                status: "SCHEDULED"
            },
            data: {
                status: "ACCEPTED",
                videoCallId : '123456'
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment accepted successfully", appointment });
    } catch (error) {
        console.error("Error accepting appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const rejectAppointment = async (req, res) => {
    const { appointmentId, doctorId } = req.params;

    // Validate required fields
    if (!appointmentId || !doctorId) {
        return res.status(400).json({ error: "Appointment ID and Doctor ID are required" });
    }

    console.log("Rejecting appointment with ID:", appointmentId, "for doctor ID:", doctorId);

    try {

        const appointment = await prisma.doctorappointment.findUnique({
            where: {
                id: Number(appointmentId),
                doctorId: Number(doctorId),
                status: "SCHEDULED"
            }
        })

        const order = await razorpay.orders.fetch(appointment.rpzOrderId);

        const refund = await razorpay.payments.refund(appointment.rpzPaymentId, {
            amount: order.amount,
            speed: 'normal',
        });

        console.log("Refund processed:", refund);

        if (!refund) {
            return res.status(400).json({ error: "Refund failed" });
        }

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }



        const newappointment = await prisma.doctorappointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: Number(doctorId),
                status: "SCHEDULED"
            },
            data: {
                rpzRefundPaymentId: refund.id,
                status: "REJECTED"
            }
        });

        if (!newappointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment rejected successfully", newappointment });
    } catch (error) {
        console.error("Error rejecting appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const completedAppointment = async (req, res) => {
    const { appointmentId, doctorId } = req.params;

    // Validate required fields
    if (!appointmentId || !doctorId) {
        return res.status(400).json({ error: "Appointment ID and Doctor ID are required" });
    }

    try {

        const appointment = await prisma.doctorappointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: Number(doctorId),
                status: "IN_PROGRESS"
            },
            data: {
                status: "COMPLETED"
            }
        });


        try {
            const order = await razorpay.orders.fetch(appointment.rpzOrderId);

            await prisma.doctor.update({
                where: {
                    id: (+appointment.doctorId)
                },
                data: {
                    amount: {
                        increment: (+order.amount) / 100
                    }
                }
            })
        } catch (error) {
            console.error("Error updating doctor amount:", error);
            await prisma.doctorappointment.update({
                where: {
                    id: Number(appointmentId),
                    doctorId: Number(doctorId),
                    status: "COMPLETED"
                },
                data: {
                    status: "IN_PROGRESS"
                }
            });

            return res.status(500).json({ error: "Internal server error" });
        }

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment completed successfully", appointment });
    } catch (error) {
        console.error("Error completing appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const inProgressAppointment = async (req, res) => {
    const { appointmentId, doctorId } = req.params;

    // Validate required fields
    if (!appointmentId || !doctorId) {
        return res.status(400).json({ error: "Appointment ID and Doctor ID are required" });
    }

    try {
        const appointment = await prisma.doctorappointment.update({
            where: {
                id: Number(appointmentId),
                doctorId: Number(doctorId),
                status: "ACCEPTED"
            },
            data: {
                status: "IN_PROGRESS"
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment is now in progress", appointment });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const getUserAppointments = async (req, res) => {
    const { userId } = req.params;

    console.log("Fetching appointments for user:", userId);

    // Validate required fields
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const appointments = await prisma.doctorappointment.findMany({
            where: {
                userId: Number(userId)
            },
            select: {
                id: true,
                patientFirstName: true,
                patientLastName: true,
                patientAge: true,
                patientGender: true,
                slot: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true
                    }
                },
                date: true,
                status: true,
                doctor: {
                    select: {
                        id: true,
                        displayName: true,
                        specialization: {
                            select: {
                                id: true,
                                label: true
                            }
                        }
                    }
                }
            }
        });


        return res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching user appointments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getDoctorAppointments = async (req, res) => {
    const { doctorId } = req.params;
    const matchedConditions = {};


    console.log("Fetching appointments for doctor:", doctorId);

    // Validate required fields
    if (!doctorId) {
        return res.status(400).json({ error: "Doctor ID is required" });
    }

    if (req.query.status) {
        matchedConditions.status = req.query.status.toUpperCase();
    }

    try {
        const appointments = await prisma.doctorappointment.findMany({
            where: {
                doctorId: Number(doctorId),
                ...matchedConditions
            },
            select: {
                id: true,
                patientFirstName: true,
                patientLastName: true,
                patientAge: true,
                patientGender: true,
                slot: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true
                    }
                },
                status: true,
                bookedBy: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            }
        });

        return res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getAppointmentById = async (req, res) => {
    const { appointmentId } = req.params;

    // Validate required fields
    if (!appointmentId) {
        return res.status(400).json({ error: "Appointment ID is required" });
    }


    try {
        const appointment = await prisma.doctorappointment.findUnique({
            where: {
                id: Number(appointmentId)
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        displayName: true,
                        specialization: {
                            select: {
                                id: true,
                                label: true
                            }
                        },
                        email: true,
                        phoneNumber: true
                    }
                },
                bookedBy: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phoneNumber: true
                    }
                },
                slot: true
            }
        });

        // rpz ids
        // appointment.rpzOrderId = 'order_RFUbA1U7sjYOip';
        // appointment.rpzPaymentId = 'pay_RFUbVAWr6l0tzQ';
        // appointment.rpzRefundPaymentId = '';

        console.log("Fetched appointment details:", appointment);


        const order = await razorpay.orders.fetch(appointment.rpzOrderId);
        const orderData = {
            orderId: order.id,
            amount: (+order.amount) / 100,
            currency: order.currency,
            status: order.status.toUpperCase(),
        };


        appointment.orderData = orderData;

        if (appointment.rpzRefundPaymentId) {
            appointment.refundData = await razorpay.refunds.fetch(appointment.rpzRefundPaymentId);
            appointment.refundData.amount = (+appointment.refundData.amount) / 100;
            appointment.refundData.status = appointment.refundData.status.toUpperCase();
        }

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        console.log("Fetched appointment video call id details:", appointment.videoCallId);

        return res.status(200).json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const handleUpload = async (req, res) => {
    uploadPrescriptionImage(req, res, async (err) => {
        try {
            if (err) {
                console.error("Error uploading prescription:", err);
                return res.status(400).json({ error: err.message });
            }

            console.log(req.files);
            
            const imageUrl = req.files?.prescription ? req.files.prescription[0].filename : null;
            const { appointmentId }= req.params;

            if (!imageUrl) {
                return res.status(400).json({ error: "Prescription file is required" });
            }

            console.log(await prisma.doctorappointment.update({
                where: { id: Number(appointmentId) },
                data: { 
                    prescriptionUrl : `prescription/${imageUrl}`
                 }
            }));

            res.status(200).json({ message: "Prescription uploaded successfully" });
        } catch (error) {
            console.error("Error uploading prescription:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};


export const handleRescheduled = async (req, res) => {
    const { appointmentId } = req.params;
    const { slotId , doctorId } = req.body

    if(!appointmentId) {
        return res.status(400).json({ error: "Appointment ID is required" });
    }

    if(!slotId || !doctorId) {
        return res.status(400).json({ error: "Slot ID and Doctor ID are required" });
    }

    try {
        const appointment = await prisma.doctorappointment.update({
            where: { 
                id: Number(appointmentId),
                doctorId: Number(doctorId)
            },
            data: {
                slotId: Number(slotId),
                isRescheduled: true,
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        return res.status(200).json({ message: "Appointment rescheduled successfully", appointment });
    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const handleGetAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.doctorappointment.findMany({
            include: {
                doctor: true,
                bookedBy: true,
                slot: true
            }
        });
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};