import prisma from "../Utils/prismaclint.js";


export const addSubscription = async (req, res) => {
    try {
        const { subscriptionName, price, timePeriod , numberOfServiceBoys , benefits } = req.body;

        console.log(req.body);
        console.log(typeof(timePeriod))

        if (!subscriptionName || !price || !benefits) {
            return res.status(400).json({ error: "All Fields Are Required" });
        }


        // if(typeof(timePeriod) != 'number' || typeof(numberOfServiceBoys) != 'number') return res.status(400).json({ error: "All Fields Are Required" });

        const subscription = await prisma.subscription.create({
            data: {
                subscriptionName,
                price,
                benefits,
                numberOfServiceBoys : +numberOfServiceBoys,
                timePeriod : +timePeriod
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
        });
        console.log(result);

        if (!result) {
            return res.status(500).json({ error: "Unable To Fetch Subscriptions" });
        }

        return res.status(200).json({ message: "Subscriptions Fetched Successfully", subscriptions : result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Unable To Fetch Subscriptions - Internal Server Error" });
    }
};


export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionName, price, timePeriod, numberOfServiceBoys, benefits } = req.body;

    if (!id || !subscriptionName || !price || !benefits || timePeriod == null || numberOfServiceBoys == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const updated = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        subscriptionName,
        price: price,
        benefits,
        timePeriod: +timePeriod,
        numberOfServiceBoys: +numberOfServiceBoys
      }
    });

    return res.status(200).json({ message: "Subscription updated successfully", data: updated });
  } catch (error) {
    console.error("Update Subscription Error:", error);
    return res.status(500).json({ error: "Unable to update subscription - internal server error" });
  }
};
