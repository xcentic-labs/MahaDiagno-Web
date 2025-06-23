import express from 'express'
import { uploadBanner } from '../Storage/ServiceStorage.js';
import { addService, deleteService , getMyService, getPartnersByZone } from '../Controller/ServiceController.js';
import { checkadmin } from '../Middleware/middleware.js';

export const ServiceRouter = express.Router();


ServiceRouter.post('/addservice', uploadBanner.single('banner') , addService); // for all the suscribed partners
ServiceRouter.delete('/deleteservice/:id', deleteService); // admin protected
ServiceRouter.get('/getmyservices/:partnerid', getMyService); // admin protected
// ServiceRouter.get('/getservicebyzone' , getServiceByZone);

ServiceRouter.get('/getpartnersbyzone' , getPartnersByZone);