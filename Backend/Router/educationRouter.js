import express from 'express';
import {
  addEducationDetail,
  updateEducationDetail,
  deleteEducationDetail,
  getEducationDetails
} from '../Controller/educationController.js';

export const educationRouter = express.Router();

// Add education detail
educationRouter.post('/add/:doctorId', addEducationDetail);

// Update education detail
educationRouter.put('/update/:educationId', updateEducationDetail);

// Delete education detail
educationRouter.delete('/delete/:educationId/:doctorId', deleteEducationDetail);

// Get education details of a doctor
educationRouter.get('/get/:doctorId', getEducationDetails);

