import prisma from "../Utils/prismaclint.js";
import crypto from 'crypto'
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

export const BuySubscription = async (req, res) => {
  try {
    const { subscriptionId, partnersId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ "error": "Payment Details Are Missing" });
    if (!Number.isInteger(subscriptionId) || !Number.isInteger(partnersId)) return res.status(400).json({ "error": "All fields Are Required" });

    const hmac = crypto.createHmac('sha256', razorpay.key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');


    if (generated_signature === razorpay_signature) {

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
        }
      })

      console.log(purchased_subscription);

      if (!purchased_subscription) return res.status(500).json({ 'error': "Unable to Purchased Subscription" });
      res.status(200).json({ "message": "Subscription Purchased  Sucessfully", purchased_subscription: purchased_subscription });
    }
    else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ "error": "Unable to Purchased Subscription Internal server error" });
  }
}

export const useCoupon = async (req, res) => {
  try {
    const { purchasedSubscriptionId, partnerId , patientFirstName , patientLastName , patientAge , gender } = req.body;

    console.log(req.body);

    // Validate required IDs
    if (
      !Number.isInteger(purchasedSubscriptionId) ||
      !Number.isInteger(partnerId)
    ) {
      return res.status(400).json({
        error: "partnerId, serviceId, and purchasedSubscriptionId are required and must be integers.",
      });
    }

    // Fetch purchased subscription
    const purchased_subscription = await prisma.subscription_purchase.findUnique({
      where : {  id : +purchasedSubscriptionId}
    })

    if (!purchased_subscription) {
      return res.status(404).json({ error: "No such subscription found" });
    }

    console.log(purchased_subscription.noOfCouponLeft);

    if (purchased_subscription.noOfCouponLeft <= 0) {
      console.log("eknaj");
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
        patient_first_name: patientFirstName,
        patient_last_name: patientLastName,
        patient_age: patientAge,
        gender: gender, 
        referring_doctor: partner.hospitalName,
        additional_phone_number: "N/A",
        IsSubscriptionBased: true,
        partnerId: partner.id,
        service_id: purchased_subscription.serviceId,
        addressId: partner.addressId,
        isPaid: true,
        modeOfPayment: 'subscriptionBased',
        isRecivesByAdmin: true
      },
    });

    // Decrement coupon count
    const updatedSubscription = await prisma.subscription_purchase.update({
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
    const partnerId = req.params.id;

    console.log(partnerId);

    if (!Number.isInteger(+partnerId)) {
      return res.status(400).json({ error: "Invalid partner ID" });
    }

    const subscriptions = await prisma.subscription_purchase.findMany({
      where: {
        partnersId: +partnerId,
        noOfCouponLeft : {
          gt : 0
        }
      },
      include: {
        service: true
      },
      orderBy : {
        purchasedAt : 'desc'
      }
    })

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

