import prisma from "../Utils/prismaclint.js";

export const BuySubscription = async (req, res) => {
    try {
        const { subscriptionId, partnersId , addressId } = req.body

        if (!Number.isInteger(subscriptionId) || !Number.isInteger(partnersId)) return res.status(400).json({ "error": "All fields Are Required" });

        const subscription = await prisma.subscription.findUnique({
            where: {
                id: +subscriptionId
            }
        });

        if (!subscription) return res.status(404).json({ "error": "Invalid Subscription ID" });

        const purchased_subscription = await prisma.subscription_purchase.create({
            data: {
                partnersId: partnersId,
                noOfCouponLeft: subscription.numberOfTimes,
                serviceId: subscription.serviceId,
                addressId : addressId
            }
        })

        if (!purchased_subscription) return res.status(500).json({ 'error': "Unable to Purchased Subscription" });
        res.status(400).json({ "message": "Subscription Purchased  Sucessfully", purchased_subscription: purchased_subscription });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Unable to Purchased Subscription Internal server error" });
    }
}

export const useCoupon = async (req, res) => {
  try {
    const { purchasedSubscriptionId, partnerId } = req.body;

    // Validate required IDs
    if (
      !Number.isInteger(purchasedSubscriptionId) ||
      !Number.isInteger(partnerId) ||
      !Number.isInteger(serviceId)
    ) {
      return res.status(400).json({
        error: "partnerId, serviceId, and purchasedSubscriptionId are required and must be integers.",
      });
    }

    // Fetch purchased subscription
    const purchased_subscription = await prisma.purchased_subscription.findUnique({
      where: { id: purchasedSubscriptionId },
    });

    if (!purchased_subscription) {
      return res.status(404).json({ error: "No such subscription found" });
    }

    if (purchased_subscription.noOfCouponLeft <= 0) {
      return res.status(400).json({ error: "You have claimed the maximum number of coupons" });
    }

    // Fetch partner (hospital) info
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: { address: true },
    });

    if (!partner) {
      return res.status(404).json({ error: "Partner (Hospital) not found" });
    }

    // Create appointment using hospital name as patient name
    const appointment = await prisma.appointment.create({
      data: {
        patient_first_name: "N/A",
        patient_last_name: "N/A",
        patient_age: "N/A",
        gender: "N/A", // adjust to valid enum value from `Gender`
        referring_doctor: partner.hospitalName,
        additional_phone_number: "N/A",
        IsSubscriptionBased : true,
        partnerId: partner.id,
        service_id : purchasedSubscriptionId.serviceId,
        addressId: partner.addressId,
        isPaid : true,
        modeOfPayment : 'subscriptionBased',
        isRecivesByAdmin : true
      },
    });

    // Decrement coupon count
    const updatedSubscription = await prisma.purchased_subscription.update({
      where: { id: purchasedSubscriptionId },
      data: {
        noOfCouponLeft: {
          decrement: 1,
        },
      },
    });

    return res.status(200).json({
      message: "Appointment created and coupon claimed successfully.",
      appointment,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error. Unable to claim coupon and create appointment.",
    });
  }
};


export const getMySubscriptions = async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!Number.isInteger(+partnerId)) {
      return res.status(400).json({ error: "Invalid partner ID" });
    }

    const subscriptions = await prisma.subscription_purchase.findMany({
      where: {
        partnersId: +partnerId,
      },
      include: {
        service: true,     // Include service details
        partners: true,    // Include partner details (optional)
      },
    });

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

