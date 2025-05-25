import express from 'express';
import { addAdmin, adminLogin, dashboardData, deleteAdmin, getAdmins } from '../Controller/AdminController.js';

export const AdminRouter = express.Router();

AdminRouter.post('/addadmin' , addAdmin); // admin protected
AdminRouter.delete('/deleteadmin/:id' , deleteAdmin); // admin protected
AdminRouter.post('/adminlogin' , adminLogin); 
AdminRouter.get('/getadmins' , getAdmins ) // admin protected


AdminRouter.get('/getdashboarddata' ,  dashboardData) //admin protectd