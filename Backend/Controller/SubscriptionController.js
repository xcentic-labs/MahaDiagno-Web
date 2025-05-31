import prisma from "../Utils/prismaclint.js";

export const addSubscription = async (req, res) => {
    try {
        const { subscriptionName, price, numberOfTimes, serviceId, benefits } = req.body;

        if (!subscriptionName || !price || !numberOfTimes || !serviceId || !benefits) {
            return res.status(400).json({ error: "All Fields Are Required" });
        }

        const subscription = await prisma.subscription.create({
            data: {
                subscriptionName,
                price,
                numberOfTimes: +numberOfTimes,
                serviceId: +serviceId,
                benefits
            }
        });

        if (!subscription) {
            return res.status(500).json({ error: "Unable To Add Subscription" });
        }

        return res.status(201).json({ message: "Subscription Added Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Unable To Add Subscription - Internal Server Error" });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "Id Is Required" });
        }

        const deleted = await prisma.subscription.delete({
            where: {
                id: +id
            }
        });

        if (!deleted) {
            return res.status(500).json({ error: "Unable To Delete Subscription" });
        }

        return res.status(200).json({ message: "Subscription Deleted Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Unable To Delete Subscription - Internal Server Error" });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const result = await prisma.subscription.findMany({
            select: {
                id: true,
                subscriptionName: true,
                numberOfTimes: true,
                price: true,
                benefits: true,
                service: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        if (!result) {
            return res.status(500).json({ error: "Unable To Fetch Subscriptions" });
        }

        return res.status(200).json({ message: "Subscriptions Fetched Successfully", subscriptions : result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Unable To Fetch Subscriptions - Internal Server Error" });
    }
};
