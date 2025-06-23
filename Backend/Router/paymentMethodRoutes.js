import express from "express";
import { addPaymentMethod, deletePaymentMethod, getAllPaymentMethods, getPaymentMethodByPartnerId } from "../Controller/paymentMethodController";


const partnerRouter = express.Router();

partnerRouter.post("/add", addPaymentMethod );
partnerRouter.delete("/delete/:id", deletePaymentMethod );
partnerRouter.get("/get/:id", getPaymentMethodByPartnerId );
partnerRouter.get("/all",  getAllPaymentMethods );

export default partnerRouter;
