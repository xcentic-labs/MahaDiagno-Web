import express from 'express';
import { BuySubscription, getMySubscriptions, useCoupon } from '../Controller/subscriptionPurchaseController.js';

export const SubscriptionPurchaseRouter = express.Router();

SubscriptionPurchaseRouter.post('/buysubscription' , BuySubscription);
SubscriptionPurchaseRouter.post('/usecoupon' , useCoupon);
SubscriptionPurchaseRouter.get('/getmysubscriptions' , getMySubscriptions);




