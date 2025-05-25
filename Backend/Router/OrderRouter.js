import express from 'express';
import { createOrder } from '../Controller/OrderController.js';

export const OrderRouter = express.Router();

OrderRouter.post('/createorder' , createOrder )