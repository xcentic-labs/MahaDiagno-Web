import prisma from "../Utils/prismaclint.js";
import crypto from 'crypto'
import Razorpay from "razorpay";
import getExpiresAt from "../Utils/timeCaluclator.js";
import logError from "../Utils/log.js";

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


      const old_purchased_subscription = await prisma.subscription_purchase.findUnique({
        where : {
          partnersId : +partnersId,
        }
      })

      

      let purchased_subscription = ''

      if (!old_purchased_subscription) {
        // buy an new subscription
        purchased_subscription = await prisma.subscription_purchase.create({
          data: {
            partnersId: partnersId,
            numberOfServiceBoyLeft: subscription.numberOfServiceBoys,
            expiresAt: getExpiresAt(subscription.timePeriod),
            purchasedAt: new Date().toISOString(),
            subscriptionId: subscriptionId
          }
        })
      } else {
        // renew old subscription
        purchased_subscription = await prisma.subscription_purchase.updatewe({
          where: {
            id: old_purchased_subscription.id
          },
          data: {
            expiresAt: getExpiresAt(subscription.timePeriod), // update the subscription date
            renewedAt : new Date().toISOString(),
          }
        })
      }

      // await 
      await prisma.partners.update({
        where: {
          id: parseInt(partnersId)
        },
        data: {
          isSubscribed: true
        }
      });


      if (!purchased_subscription) return res.status(500).json({ 'error': "Unable to Purchased Subscription" });
      res.status(200).json({ "message": "Subscription Purchased  Sucessfully", purchased_subscription: purchased_subscription });
    }
    else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    logError(error);
    return res.status(500).json({ "error" : "Unable to Purchased Subscription Internal server error" });
  }
}

export const getMySubscriptions = async (req, res) => {
  try {
    const partnerId = req.params.id;

    

    if (!Number.isInteger(+partnerId)) {
      return res.status(400).json({ error: "Invalid partner ID" });
    }

    const subscriptions = await prisma.subscription_purchase.findMany({
      where: {
        partnersId: +partnerId,
      },
      include: {
        subscription: true
      }
    })


    const subscriptionsCheckArr = subscriptions.filter((sup) => {
      return new Date(sup.expiresAt) < new Date()
    })


    if (subscriptionsCheckArr.length == subscriptions.length) {
      await prisma.partners.update({
        where: {
          id: +partnerId
        },
        data: {
          isSubscribed: false,
        }
      });

      await prisma.serviceboy.updateMany({
        where: {
          partnerId: +partnerId
        },
        data: {
          isActive: false
        }
      })
    }

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (error) {
    logError("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

