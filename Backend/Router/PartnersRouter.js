import express from 'express'
import { chagePassword, createPartnersAccount, deletePartners, getAllPartners, getForgotPasswordOtp, getPartners, partnersLogin } from '../Controller/PartnersController.js';
import { checkadmin } from '../Middleware/middleware.js';
export const PartnersRouter = express.Router();


PartnersRouter.post('/createaccount' ,  createPartnersAccount);
PartnersRouter.get('/getpartners/:id' , getPartners);
PartnersRouter.post('/partnerslogin' , partnersLogin)


// admin routes 
PartnersRouter.delete('/deletepartners' , checkadmin , deletePartners);
PartnersRouter.get('/getallpartners' , checkadmin ,getAllPartners);

// forgot password
PartnersRouter.post('/getotp' , getForgotPasswordOtp);
PartnersRouter.post('/chagepassword' , chagePassword);

