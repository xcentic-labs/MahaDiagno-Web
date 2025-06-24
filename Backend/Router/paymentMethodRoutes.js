import express from "express";
import { addPaymentMethod, deletePaymentMethod, getAllPaymentMethods, getPaymentMethodByPartnerId } from "../Controller/paymentMethodController.js";


const paymentMethodRouter = express.Router();

paymentMethodRouter.post("/add", addPaymentMethod );
paymentMethodRouter.delete("/delete/:id", deletePaymentMethod );
paymentMethodRouter.get("/get/:id", getPaymentMethodByPartnerId );
paymentMethodRouter.get("/all",  getAllPaymentMethods );

export default paymentMethodRouter;
