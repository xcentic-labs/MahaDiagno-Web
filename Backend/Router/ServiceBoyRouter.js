import express from 'express'
import { addServiceBoy, changeStatus, deleteServiceBoy, getAllServiceBoys, getServiceBoy, getSpecficServiceBoy, handleUpdateCashToRecived, serviceBoyLogin, UpdatePassword } from '../Controller/ServiceBoyController.js';
import { checkadmin } from '../Middleware/middleware.js';
export const ServiceBoyRouter = express.Router();

ServiceBoyRouter.post('/addserviceboy' , checkadmin, addServiceBoy); // admin protected
ServiceBoyRouter.post('/login' , serviceBoyLogin);


ServiceBoyRouter.delete('/deleteserviceboy/:id' ,checkadmin, deleteServiceBoy); // admin protected
ServiceBoyRouter.get('/getallserviceboy' ,checkadmin, getAllServiceBoys); // admin protected

ServiceBoyRouter.get('/getserviceboy/:id' , getServiceBoy); 
ServiceBoyRouter.patch('/updatepasswrod/:id' , UpdatePassword);
ServiceBoyRouter.patch('/changestatus/:id' , changeStatus); 


ServiceBoyRouter.get('/getspecficserviceboy/:id' , getSpecficServiceBoy);

ServiceBoyRouter.patch('/updatedcashrecived/:id', checkadmin, handleUpdateCashToRecived); // admin protected
