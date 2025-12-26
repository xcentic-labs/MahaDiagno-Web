import express from "express";
import { addWithdraw, deleteWithdraw, getAllWithdraws, getWithdrawByDoctorId, getWithdrawByPartnerId, updateWithdrawStatus , addWithdrawOfPharmacyVendor , getWithdrawBypharmacyVendorId } from "../Controller/withdrawController.js";


const withdrawRouter = express.Router();

withdrawRouter.post("/add", addWithdraw);
withdrawRouter.post("/add/pharmacyvendor", addWithdrawOfPharmacyVendor);
withdrawRouter.delete("/delete/:id", deleteWithdraw);
withdrawRouter.get("/get/:id", getWithdrawByPartnerId);
withdrawRouter.get("/get/doctor/:id", getWithdrawByDoctorId);
withdrawRouter.get("/get/pharmacyvendor/:id", getWithdrawBypharmacyVendorId);



withdrawRouter.get("/all", getAllWithdraws);
withdrawRouter.patch('/updatestatus/:id', updateWithdrawStatus)

export default withdrawRouter;
