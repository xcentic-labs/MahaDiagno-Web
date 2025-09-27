import {
    addSlots, 
    getSlots,
    deleteSlot,
    getFreeSlots
} from '../Controller/slotController.js';
import express from 'express';

export const slotRouter = express.Router();

slotRouter.post('/add', addSlots);
slotRouter.get('/get/:timingId', getSlots);
slotRouter.delete('/delete/:slotId', deleteSlot);
slotRouter.get('/getfreeslots/:timingsId/:date', getFreeSlots);

