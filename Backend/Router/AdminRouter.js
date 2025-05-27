import express from 'express';
import { addAdmin, adminLogin, dashboardData, deleteAdmin, getAdmins } from '../Controller/AdminController.js';
import { checkadmin } from '../Middleware/middleware.js';

export const AdminRouter = express.Router();

AdminRouter.post('/addadmin' , checkadmin, addAdmin); // admin protected
AdminRouter.delete('/deleteadmin/:id' , checkadmin, deleteAdmin); // admin protected
AdminRouter.post('/adminlogin' , adminLogin); 
AdminRouter.get('/getadmins' ,checkadmin, getAdmins ) // admin protected


AdminRouter.get('/getdashboarddata' , checkadmin, dashboardData) //admin protectd