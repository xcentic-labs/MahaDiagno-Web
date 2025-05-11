import express from 'express';
import { addAdmin, adminLogin, deleteAdmin, getAdmins } from '../Controller/AdminController.js';

export const AdminRouter = express.Router();

AdminRouter.post('/addadmin' , addAdmin);
AdminRouter.delete('/deleteadmin/:id' , deleteAdmin);
AdminRouter.post('/adminlogin' , adminLogin);
AdminRouter.get('/getadmins' , getAdmins )