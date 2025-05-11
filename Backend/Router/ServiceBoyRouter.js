import express from 'express'
import { addServiceBoy, changeStatus, deleteServiceBoy, getAllServiceBoys, getServiceBoy, serviceBoyLogin, UpdatePassword } from '../Controller/ServiceBoyController.js';

export const ServiceBoyRouter = express.Router();

ServiceBoyRouter.post('/addserviceboy' , addServiceBoy);
ServiceBoyRouter.post('/login' , serviceBoyLogin);
ServiceBoyRouter.delete('/deleteserviceboy/:id' , deleteServiceBoy);
ServiceBoyRouter.get('/getallserviceboy' , getAllServiceBoys);
ServiceBoyRouter.get('/getserviceboy/:id' , getServiceBoy);
ServiceBoyRouter.patch('/updatepasswrod/:id' , UpdatePassword);
ServiceBoyRouter.patch('/changestatus/:id' , changeStatus);
