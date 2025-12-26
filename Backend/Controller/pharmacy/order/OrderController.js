import prisma from '../../../Utils/prismaclint.js'
import crypto from 'crypto'
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});


// ====================== Pharmacy Order ======================
export const createOrder = async (req, res) => {
    try {
        const { userId, pharmacyVendorId, totalAmount, modeOfPayment, orderItems, addressId } = req.body;

        console.log(req.body);

        if (!userId || !pharmacyVendorId || !totalAmount || !modeOfPayment || !orderItems || orderItems.length === 0 || !addressId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // check order items format
        for (const item of orderItems) {
            if (!item.medicineId || !item.quantity || !item.price) {
                return res.status(400).json({ error: "Invalid order items format" });
            }
        }

        let orderData = {
            userId: +userId,
            pharmacyVendorId: +pharmacyVendorId,
            totalAmount: +totalAmount,
            modeOfPayment: modeOfPayment,
            addressId: +addressId
        };

        if (modeOfPayment === 'razorpay') {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ "error": "Payment Details Are Missing" });
            }

            const hmac = crypto.createHmac('sha256', razorpay.key_secret);
            hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');

            if (generated_signature !== razorpay_signature) {
                return res.status(400).json({ "error": "Invalid Payment Signature" });
            }

            orderData.razorpayOrderId = razorpay_order_id;
            orderData.razorpayPaymentId = razorpay_payment_id;
            orderData.razorpaySignature = razorpay_signature;
            orderData.isPaid = true;

            const newOrder = await prisma.order.create({
                data: orderData
            });

            for (const item of orderItems) {
                await prisma.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        medicineId: +item.medicineId,
                        quantity: +item.quantity,
                        price: +item.price
                    }
                });
            }

            return res.status(201).json({ message: "Order created successfully", data: newOrder });

        } else {

            const newOrder = await prisma.order.create({
                data: orderData
            });

            for (const item of orderItems) {
                await prisma.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        medicineId: +item.medicineId,
                        quantity: +item.quantity,
                        price: +item.price
                    }
                });
            }

            return res.status(201).json({ message: "Order created successfully", data: newOrder });
        }

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                userId: true,
                pharmacyVendorId: true,
                totalAmount: true,
                orderstatus: true,
                modeOfPayment: true,
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phoneNumber : true
                    }
                },
                pharmacyVendor: {
                    select: {
                        name: true,
                        shopName: true
                    }
                },
                address: true,
                orderItem: true

            }
        });
        return res.status(200).json({ data: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                orderItem: {
                    include: {
                        medicine: true
                    }
                },
                user: true,
                pharmacyVendor: true,
                address: true
            }
        });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        return res.status(200).json({ data: order });
    } catch (error) {
        console.error("Error fetching order:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderstatus } = req.body;
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { orderstatus }
        });
        return res.status(200).json({ message: "Order status updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export const getOrderByVendorId = async (req, res) => {
    try {
        const { pharmacyVendorId } = req.params;
        const orders = await prisma.order.findMany({
            where: { pharmacyVendorId: parseInt(pharmacyVendorId) },
            select: {
                id: true,
                userId: true,
                pharmacyVendorId: true,
                totalAmount: true,
                orderstatus: true,
                modeOfPayment: true,
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phoneNumber : true
                    }
                },
                pharmacyVendor: {
                    select: {
                        name: true,
                        shopName: true
                    }
                },
                address: true,
                orderItem: true

            }
        });
        return res.status(200).json({ data: orders });
    }
    catch (error) {
        console.error("Error fetching orders by vendor ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getOrderByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(userId) },
            include: {
                orderItem: true,
                address: true
            }
        });
        return res.status(200).json({ data: orders });
    }
    catch (error) {
        console.error("Error fetching orders by vendor ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};