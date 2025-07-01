import express from 'express';
import { addSubscription, deleteSubscription, getSubscriptions , updateSubscription } from '../Controller/SubscriptionController.js';

export const SubscriptionRouter = express.Router();

SubscriptionRouter.post('/addsubscription' , addSubscription);
SubscriptionRouter.delete('/deletesubscription/:id' , deleteSubscription);
SubscriptionRouter.get('/getsubscription' , getSubscriptions);
SubscriptionRouter.put('/updatesubscription/:id', updateSubscription);


