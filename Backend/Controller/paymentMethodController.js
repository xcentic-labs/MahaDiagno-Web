import prisma from "../Utils/prismaclint.js";
import logError from "../Utils/log.js";
// ➕ Add a Payment Method
export const addPaymentMethod = async (req, res) => {
    try {
        const { partnerId, bankName, accountNumber, ifscCode, bankeeName } = req.body;

        

        if (!partnerId || !bankName || !accountNumber || !ifscCode || !bankeeName) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newPayment = await prisma.paymentMethod.create({
            data: {
                partnerId,
                bankName,
                accountNumber,
                ifscCode,
                bankeeName,
            },
        });

        return res.status(201).json(newPayment);
    } catch (error) {
        logError("Error adding payment method:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ❌ Delete a Payment Method by ID
export const deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: "PaymentMethod ID is required" });

        const deleted = await prisma.paymentMethod.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: "Payment Method deleted successfully", deleted });
    } catch (error) {
        logError("Error deleting payment method:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 🔍 Get Payment Method by ID
export const getPaymentMethodByPartnerId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: "PaymentMethod ID is required" });

        const payment = await prisma.paymentMethod.findMany({
            where: {  partnerId : +id },
            include: { partner: true },
        });

        if (!payment) return res.status(404).json({ error: "Payment method not found" });

        return res.status(200).json(payment);
    } catch (error) {
        logError("Error fetching payment method:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 📃 Get All Payment Methods
export const getAllPaymentMethods = async (req, res) => {
    try {
        const payments = await prisma.paymentMethod.findMany({
            include: { partner: true },
            orderBy: { id: "desc" },
        });

        return res.status(200).json(payments);
    } catch (error) {
        logError("Error fetching payment methods:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
