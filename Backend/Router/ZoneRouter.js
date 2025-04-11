import express from 'express';
import { addZone, checkPincode, deleteZone, getZone } from '../Controller/ZoneController.js';

export const ZoneRouter = express.Router()


ZoneRouter.post('/addzone' , addZone);
ZoneRouter.delete('/deletezone/:id' , deleteZone);
ZoneRouter.get('/getzones' , getZone);
ZoneRouter.post('/checkpincode' , checkPincode)

