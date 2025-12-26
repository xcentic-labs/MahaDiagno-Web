import express from 'express';
import { addMedicine , updateMedicine ,getAllMedicines ,getMedicinesByPharmacyVendor ,deactivateMedicine , getMedicineById } from '../../../Controller/pharmacy/medicine/medicineController.js';


export const MedicineRouter = express.Router();

MedicineRouter.post('/addmedicine' , addMedicine);
MedicineRouter.put('/updatemedicine/:id' , updateMedicine);
MedicineRouter.get('/getallmedicines' , getAllMedicines);
MedicineRouter.get('/getmedicinesbypharmacyvendor/:pharmacyVendorId' , getMedicinesByPharmacyVendor);
MedicineRouter.delete('/deactivatemedicine/:id' , deactivateMedicine);
MedicineRouter.get('/getmedicinebyid/:id' , getMedicineById);