import express from 'express';
import { BuySubscription, getMySubscriptions } from '../Controller/SubscriptionPurchaseController.js';

export const SubscriptionPurchaseRouter = express.Router();

SubscriptionPurchaseRouter.post('/buysubscription' , BuySubscription);
SubscriptionPurchaseRouter.get('/getmysubscriptions/:id' , getMySubscriptions);




