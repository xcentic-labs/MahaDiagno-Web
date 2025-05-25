import express from 'express'
import { acceptAppointment, cancleAppointment, completeAppointment, deleteAppointment, getAllAppointments, getAppointments, getPersonalAppointments, getSpecificAppointment, handleMarkAsPaid, serviceBoyAppointments, updateStatus, uploadReport } from '../Controller/AppointmentController.js';
import { addAppointment } from '../Controller/OrderController.js';


export const AppointmentRouter = express.Router();

// creat appointement
AppointmentRouter.post('/createappointement' , addAppointment);

// delete
AppointmentRouter.delete('/deleteappointement/:id' , deleteAppointment);

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


// update status
AppointmentRouter.post('/updatestatus' , updateStatus); // admin protected

// upload report
AppointmentRouter.post('/uploadreport/:id' , uploadReport); // admin protectd

// mark as paid 
AppointmentRouter.post('/markaspaid' , handleMarkAsPaid); // admin protectd