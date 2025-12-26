import express from "express";
import {
    addMedicineCategory,
    updateMedicinNameCategory,
    getMedicineCategories,
    deactivateMedicineCategory,
    getMedicineCategoryById,

    addMedicineSubCategory,
    updateMedicineSubCategoryName,
    deactivateMedicineSubCategory,
    getMedicineSubCategoriesByCategoryId
} from "../../../Controller/pharmacy/medicineCategory/medicineCategoryController.js";


export const MedicineCategoryRouter = express.Router();

// Medicine Category Routes
MedicineCategoryRouter.post('/addmedicinecategory', addMedicineCategory);
MedicineCategoryRouter.put('/updatemedicinecategory/:id', updateMedicinNameCategory);
MedicineCategoryRouter.get('/getmedicinecategory/:id', getMedicineCategoryById);
MedicineCategoryRouter.get('/getmedicinecategories', getMedicineCategories);
MedicineCategoryRouter.delete('/deactivatemedicinecategory/:id', deactivateMedicineCategory);
// Medicine Sub Category Routes
MedicineCategoryRouter.post('/addmedicinesubcategory', addMedicineSubCategory);
MedicineCategoryRouter.put('/updatemedicinesubcategory/:id', updateMedicineSubCategoryName);
MedicineCategoryRouter.delete('/deactivatemedicinesubcategory/:id', deactivateMedicineSubCategory);
MedicineCategoryRouter.get('/getmedicinesubcategoriesbycategoryid/:categoryId', getMedicineSubCategoriesByCategoryId);