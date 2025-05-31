import express from 'express'
import { createPartnersAccount, deletePartners, getAllPartners, getPartners, partnersLogin } from '../Controller/PartnersController';
import { checkadmin } from '../Middleware/middleware';
export const PartnersRouter = express.Router();


PartnersRouter.post('/createaccount' ,  createPartnersAccount);
PartnersRouter.get('/getpartners/:id' , getPartners);
PartnersRouter.post('/partnerslogin' , partnersLogin)


// admin routes 
PartnersRouter.delete('/deletepartners' , checkadmin , deletePartners);
PartnersRouter.get('/getallpartners' , checkadmin ,getAllPartners);

