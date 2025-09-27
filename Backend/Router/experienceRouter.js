import {
    addExperienceDetail,
    updateExperienceDetail,
    deleteExperienceDetail,
    getExperienceDetails
} from '../Controller/experienceController.js';
import express from 'express';

export const experienceRouter = express.Router();

// Add experience detail
experienceRouter.post('/add/:doctorId', addExperienceDetail);

// Update experience detail
experienceRouter.put('/update/:experienceId/:doctorId', updateExperienceDetail);

// Delete experience detail
experienceRouter.delete('/delete/:experienceId/:doctorId', deleteExperienceDetail);

// Get experience details of a doctor
experienceRouter.get('/get/:doctorId', getExperienceDetails);
