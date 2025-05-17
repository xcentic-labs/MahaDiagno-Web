import express from 'express'
import { uploadBanner } from '../Storage/ServiceStorage.js';
import { addService, deleteService, getService } from '../Controller/ServiceController.js';

export const ServiceRouter = express.Router();


ServiceRouter.post('/addservice' , uploadBanner.single('banner') , addService); // admin protected
ServiceRouter.delete('/deleteservice/:id' , deleteService); // admin protected
ServiceRouter.get('/getservices' , getService); // admin protected