import express from "express";
import { addPaymentMethod, deletePaymentMethod, getAllPaymentMethods, getPaymentMethodByDoctorId, getPaymentMethodByPartnerId , getPaymentMethodByPharmacyVendorId } from "../Controller/paymentMethodController.js";


const paymentMethodRouter = express.Router();

paymentMethodRouter.post("/add", addPaymentMethod );
paymentMethodRouter.delete("/delete/:id", deletePaymentMethod );
paymentMethodRouter.get("/get/:id", getPaymentMethodByPartnerId );
paymentMethodRouter.get("/get/doctor/:id", getPaymentMethodByDoctorId );
paymentMethodRouter.get("/get/pharmacyVendor/:id", getPaymentMethodByPharmacyVendorId );
paymentMethodRouter.get("/all",  getAllPaymentMethods );

export default paymentMethodRouter;
