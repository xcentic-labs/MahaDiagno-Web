import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderByVendorId,
  getOrderByUserId
} from '../../../Controller/pharmacy/order/OrderController.js';

export const MedicineOrderRouter = express.Router();

MedicineOrderRouter.post('/createorder', createOrder);
MedicineOrderRouter.get('/orders', getAllOrders);
MedicineOrderRouter.get('/orders/:id', getOrderById);
MedicineOrderRouter.patch('/orders/:id/status', updateOrderStatus);
MedicineOrderRouter.get('/vendor/:pharmacyVendorId/orders', getOrderByVendorId);
MedicineOrderRouter.get('/user/:userId/orders', getOrderByUserId);