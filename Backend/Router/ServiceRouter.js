import express from 'express'
import { uploadBanner } from '../Storage/ServiceStorage.js';
import { addService, deleteService, getService } from '../Controller/ServiceController.js';
import { checkadmin } from '../Middleware/middleware.js';

export const ServiceRouter = express.Router();


ServiceRouter.post('/addservice' ,checkadmin, uploadBanner.single('banner') , addService); // admin protected
ServiceRouter.delete('/deleteservice/:id' , checkadmin,deleteService); // admin protected
ServiceRouter.get('/getservices', getService); // admin protected