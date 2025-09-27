import express from 'express';
import {
  addPatientDetail,
  updatePatientDetail,
  deletePatientDetail,
  getPatientByUserId,
  
} from '../Controller/patientController.js';

export const patientRouter = express.Router();

// Define your patient-related routes here
// For example:
patientRouter.post('/add', addPatientDetail);
patientRouter.put('/update/:patientId', updatePatientDetail);
patientRouter.delete('/delete/:patientId', deletePatientDetail);
patientRouter.get('/user/:userId', getPatientByUserId);
