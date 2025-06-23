import express from 'express'
import { addServiceBoy, changeStatus, deleteServiceBoy, getAllServiceBoys, getMyServiceBoy, getServiceBoy, getSpecficServiceBoy, handleUpdateCashToRecived, serviceBoyLogin, UpdatePassword } from '../Controller/ServiceBoyController.js';
import { checkadmin } from '../Middleware/middleware.js';
import { getMyService } from '../Controller/ServiceController.js';
export const ServiceBoyRouter = express.Router();

ServiceBoyRouter.post('/addserviceboy', addServiceBoy);
ServiceBoyRouter.post('/login' , serviceBoyLogin);


ServiceBoyRouter.delete('/deleteserviceboy/:id', deleteServiceBoy); // admin protected
ServiceBoyRouter.get('/getallserviceboy' , getAllServiceBoys); // admin protected

ServiceBoyRouter.get('/getmyserviceboy/:partnerid' , getMyServiceBoy);

ServiceBoyRouter.get('/getserviceboy/:id' , getServiceBoy); 
ServiceBoyRouter.patch('/updatepasswrod/:id' , UpdatePassword);
ServiceBoyRouter.patch('/changestatus/:id' , changeStatus); 


ServiceBoyRouter.get('/getspecficserviceboy/:id' , getSpecficServiceBoy);

ServiceBoyRouter.patch('/updatedcashrecived/:id', handleUpdateCashToRecived);
