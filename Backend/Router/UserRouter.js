import express from 'express'
import { getopt, getuser, updateUser, verifyOtp } from '../Controller/UserController.js';

export const UserRouter =  express.Router();

UserRouter.post('/getotp' ,getopt );
UserRouter.post('/verifyotp' , verifyOtp);
UserRouter.post('/updateuser/:id' , updateUser);
UserRouter.get('/getuser/:id' , getuser);