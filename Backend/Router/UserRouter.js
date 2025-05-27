import express from 'express'
import { deleteUser, getAllUser, getopt, getUser, updateUser, verifyOtp } from '../Controller/UserController.js';
import { checkadmin } from '../Middleware/middleware.js';


export const UserRouter =  express.Router();

UserRouter.post('/getotp' , getopt );
UserRouter.post('/verifyotp' , verifyOtp);
UserRouter.post('/updateuser/:id' , updateUser);
UserRouter.get('/getuser/:id' , getUser);

UserRouter.get('/getalluser' ,checkadmin , getAllUser); // admin protected
UserRouter.delete('/deleteuser/:id' ,checkadmin , deleteUser); // admin protected
