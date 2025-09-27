import express from 'express';
import { 
    addSymptom, 
    getAllSymptoms, 
    getSymptomById, 
    getSymptomsBySpecialization,
    updateSymptom, 
    deleteSymptom 
} from '../Controller/symptomController.js';

const router = express.Router();

// POST route to add a new symptom
router.post('/add', addSymptom);

// GET route to get all symptoms (can filter by specializationId via query parameter)
router.get('/getall', getAllSymptoms);

// GET route to get symptom by ID
router.get('/get/:id', getSymptomById);

// GET route to get symptoms by specialization ID
router.get('/specialization/:specializationId', getSymptomsBySpecialization);

// PUT route to update symptom
router.put('/update/:id', updateSymptom);

// DELETE route to delete symptom
router.delete('/delete/:id', deleteSymptom);

export { router as symptomRouter };
