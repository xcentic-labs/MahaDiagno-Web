import prisma from "../Utils/prismaclint.js";

// ➕ Add Withdraw
export const addWithdraw = async (req, res) => {
    try {
        const { partnerId, amount, paymentMethodId } = req.body;

        if (!partnerId || !amount || !paymentMethodId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const withdraw = await prisma.withdraw.create({
            data: {
                partnerId,
                amount,
                paymentMethodId,
                status: "PENDING", // default, but can be changed here if needed
            },
        });

        return res.status(201).json(withdraw);
    } catch (error) {
        console.error("Error creating withdraw:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ❌ Delete Withdraw by ID
export const deleteWithdraw = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: "Withdraw ID is required" });

        const deleted = await prisma.withdraw.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: "Withdraw deleted successfully", deleted });
    } catch (error) {
        console.error("Error deleting withdraw:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 🔍 Get Withdraw by ID
export const getWithdrawByPartnerId = async (req, res) => {
    try {
        const { id } = req.params;

        const withdraw = await prisma.withdraw.findMany({
            where: { partnerId : Number(id) },
            include: {
                partner: true,
                paymentMethod: true,
            },
        });

        if (!withdraw) return res.status(404).json({ error: "Withdraw not found" });

        return res.status(200).json(withdraw);
    } catch (error) {
        console.error("Error fetching withdraw:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 📃 Get All Withdraws
export const getAllWithdraws = async (req, res) => {
    try {
        const withdraws = await prisma.withdraw.findMany({
            include: {
                partner: true,
                paymentMethod: true,
            },
            orderBy: { id: "desc" },
        });

        return res.status(200).json(withdraws);
    } catch (error) {
        console.error("Error fetching withdraws:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// ✅ Update Withdraw Status
export const updateWithdrawStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate ID and Status
        if (!id || !status) {
            return res.status(400).json({ error: "Withdraw ID and status are required" });
        }

        // Optional: Validate allowed statuses
        const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const updatedWithdraw = await prisma.withdraw.update({
            where: { id: Number(id) },
            data: { status },
        });

        return res.status(200).json({ message: "Status updated successfully", data: updatedWithdraw });
    } catch (error) {
        console.error("Error updating withdraw status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
