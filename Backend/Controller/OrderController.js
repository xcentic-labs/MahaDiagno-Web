import prisma from "../Utils/prismaclint.js";
import crypto from 'crypto'
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});



// add appointment for users
export const addAppointment = async (req, res) => {
    try {
        console.log(req.body)
        const { patientFirstName, patientLastName, patientAge, gender, doctorName, AdditionalPhoneNumber, userId, serviceId, addressId, modeOfPayment , partnerId } = req.body

        let dataToBeSaved = {
            patient_first_name: patientFirstName,
            patient_last_name: patientLastName,
            patient_age: patientAge,
            gender: gender,
            referring_doctor: doctorName,
            additional_phone_number: AdditionalPhoneNumber,
            userId: +userId,
            service_id: +serviceId,
            partnerId : +partnerId
        }

        const service = await prisma.services.findUnique({
            where: {
                id: serviceId
            }
        })

        if (service.isHomeServiceAvail) {
            dataToBeSaved.addressId = addressId
        }

        if (modeOfPayment == 'razorpay') {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ "error": "Payment Details Are Missing" });

            const hmac = crypto.createHmac('sha256', razorpay.key_secret);
            hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');


            if (generated_signature === razorpay_signature) {
                const appointment = await prisma.appointment.create({
                    data: {
                        ...dataToBeSaved,
                        modeOfPayment: modeOfPayment,
                        isPaid: true,
                        isRecivesByPartner: true
                    },
                });

                console.log(appointment)

                if (!appointment) return res.status(500).json({ "error": "Unable to Add Appointment" });
                return res.status(201).json({ "message": "Appointment Added Sucessfully" });

            } else {
                return res.status(400).json({ success: false, message: 'Invalid signature' });
            }
        }
        else {

            if (!patientFirstName || !patientLastName || !patientAge || !gender || !doctorName || !AdditionalPhoneNumber || !userId || !serviceId || !modeOfPayment) return res.status(400).json({ "error": "All Fields Are Required" });


            const appointment = await prisma.appointment.create({
                data: {
                    ...dataToBeSaved,
                    modeOfPayment: modeOfPayment
                },
            });

            console.log(appointment)

            if (!appointment) return res.status(500).json({ "error": "Unable to Add Appointment" });
            return res.status(201).json({ "message": "Appointment Added Sucessfully" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Unable to Add Appointment Internal Server Error" });
    }
}


export const createOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount,
            currency,
            receipt,
        });

        console.log(order)

        return res.status(200).json(order);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to create order', details: err });
    }
}