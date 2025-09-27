import express from 'express';

import { 
    acceptAppointment, 
    addAppointment, 
    cancelAppointment, 
    completedAppointment, 
    inProgressAppointment, 
    rejectAppointment, 
    getUserAppointments, 
    getDoctorAppointments,
    createOrder,
    getAppointmentById,
    handleUpload,
    handleRescheduled,
    handleGetAllAppointments
} from '../Controller/doctorappointmentController.js';

export const doctorappointmentRouter = express.Router();

doctorappointmentRouter.post('/add', addAppointment);
doctorappointmentRouter.post('/create-order', createOrder);

doctorappointmentRouter.patch('/cancel/:appointmentId/:userId', cancelAppointment);
doctorappointmentRouter.patch('/accept/:appointmentId/:doctorId', acceptAppointment);
doctorappointmentRouter.patch('/reject/:appointmentId/:doctorId', rejectAppointment);


doctorappointmentRouter.patch('/complete/:appointmentId/:doctorId', completedAppointment);
doctorappointmentRouter.patch('/in-progress/:appointmentId/:doctorId', inProgressAppointment);

doctorappointmentRouter.get('/get/user/:userId', getUserAppointments);
doctorappointmentRouter.get('/get/doctor/:doctorId', getDoctorAppointments);
doctorappointmentRouter.get('/get/:appointmentId', getAppointmentById);


doctorappointmentRouter.patch('/upload/prescription/:appointmentId', handleUpload);
doctorappointmentRouter.patch('/reschedule/:appointmentId', handleRescheduled);

doctorappointmentRouter.get('/getall', handleGetAllAppointments); // admin protected




