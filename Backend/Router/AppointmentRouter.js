import express from 'express'
import { acceptAppointment, addAppointment, cancleAppointment, completeAppointment, deleteAppointment, getAllAppointments, getAppointments, getPersonalAppointments, getSpecificAppointment, serviceBoyAppointments } from '../Controller/AppointmentController.js';

export const AppointmentRouter = express.Router();

// creat appointement
AppointmentRouter.post('/createappointement' , addAppointment);

// delete
AppointmentRouter.delete('/deleteappointement' , deleteAppointment);

// get routes
AppointmentRouter.get('/getallappointement' , getAllAppointments);  // admin protected
AppointmentRouter.get('/myappointement/:id' , getPersonalAppointments);

// gtespecfic 
AppointmentRouter.get('/getSpecificappointment/:id' , getSpecificAppointment);

// Service router to get 
AppointmentRouter.get('/serviceboyappointement/:id' , serviceBoyAppointments);
AppointmentRouter.get('/getappointement' , getAppointments);


// update status of appointement
AppointmentRouter.patch('/acceptappointement' , acceptAppointment);
AppointmentRouter.patch('/completappointement' , completeAppointment);
AppointmentRouter.patch('/cancleappointement' , cancleAppointment);