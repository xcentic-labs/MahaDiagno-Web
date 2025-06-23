import express from 'express';
import { addZone, checkPincode, deleteZone, getZone } from '../Controller/ZoneController.js';
import { checkadmin } from '../Middleware/middleware.js';
export const ZoneRouter = express.Router()


ZoneRouter.post('/addzone' , addZone); // admin protected
ZoneRouter.delete('/deletezone/:id' ,checkadmin, deleteZone); // admin protected
ZoneRouter.get('/getzones' , getZone);
ZoneRouter.post('/checkpincode' , checkPincode)

