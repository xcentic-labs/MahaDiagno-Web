import {
  updateTimingDetails,
  getTimingDetails,
  getAvailableTimings
} from '../Controller/timingController.js';
import express from 'express';

export const timingRouter = express.Router();


// Update an existing timing
timingRouter.put('/update/:doctorId', updateTimingDetails);

// Get all timings
timingRouter.get('/get/:doctorId', getTimingDetails);

timingRouter.get('/get/available/:doctorId', getAvailableTimings);
