import express from 'express';
import { 
    addSpecialization, 
    getAllSpecializations, 
    getSpecializationById, 
    updateSpecialization, 
    deleteSpecialization 
} from '../Controller/specializationController.js';

const router = express.Router();

// POST route to add a new specialization
router.post('/add', addSpecialization);

// GET route to get all specializations
router.get('/getall', getAllSpecializations);

// GET route to get specialization by ID
router.get('/get/:id', getSpecializationById);

// PUT route to update specialization
router.put('/update/:id', updateSpecialization);

// DELETE route to delete specialization
router.delete('/delete/:id', deleteSpecialization);

export { router as specializationRouter };
