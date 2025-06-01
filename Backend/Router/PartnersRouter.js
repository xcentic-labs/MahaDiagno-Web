import express from 'express'
import { createPartnersAccount, deletePartners, getAllPartners, getPartners, partnersLogin } from '../Controller/PartnersController.js';
import { checkadmin } from '../Middleware/middleware.js';
export const PartnersRouter = express.Router();


PartnersRouter.post('/createaccount' ,  createPartnersAccount);
PartnersRouter.get('/getpartners/:id' , getPartners);
PartnersRouter.post('/partnerslogin' , partnersLogin)


// admin routes 
PartnersRouter.delete('/deletepartners' , checkadmin , deletePartners);
PartnersRouter.get('/getallpartners' , checkadmin ,getAllPartners);

