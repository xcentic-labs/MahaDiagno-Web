import express from "express";
import { addPharmacyVendor , updatePharmacyVendor , getAllPharmacyVendors, getMyPharmacyVendorProfile , deactivatePharmacyVendor , sendPharmacyVendorOtp , pharmacyVendorLogin , getPharmacyVendorAmountById, getPharmacyVendorsDashboard } from "../../../Controller/pharmacy/pharmacyVendor/pharmacyVendorController.js";


export const PharmacyVendorRouter = express.Router();


PharmacyVendorRouter.post('/addpharmacyvendor' , addPharmacyVendor);
PharmacyVendorRouter.put('/updatepharmacyvendor/:id' , updatePharmacyVendor);
PharmacyVendorRouter.get('/getallpharmacyvendors' , getAllPharmacyVendors);
PharmacyVendorRouter.get('/getmypharmacyvendorprofile/:id' , getMyPharmacyVendorProfile);
PharmacyVendorRouter.delete('/deactivatepharmacyvendor/:id' , deactivatePharmacyVendor);
PharmacyVendorRouter.post('/sendpharmacyvendorotp' , sendPharmacyVendorOtp);
PharmacyVendorRouter.post('/pharmacyvendorlogin' , pharmacyVendorLogin);
PharmacyVendorRouter.get('/get/wallet/:id', getPharmacyVendorAmountById);
PharmacyVendorRouter.get('/dashboard/:id', getPharmacyVendorsDashboard);
