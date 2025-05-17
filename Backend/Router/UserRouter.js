import express from 'express'
import { deleteUser, getAllUser, getopt, getUser, updateUser, verifyOtp } from '../Controller/UserController.js';

export const UserRouter =  express.Router();

UserRouter.post('/getotp' ,getopt );
UserRouter.post('/verifyotp' , verifyOtp);
UserRouter.post('/updateuser/:id' , updateUser);
UserRouter.get('/getuser/:id' , getUser);

UserRouter.get('/getalluser' , getAllUser); // admin protected
UserRouter.delete('/deleteuser/:id' , deleteUser); // admin protected
