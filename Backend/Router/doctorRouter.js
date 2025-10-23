import express from 'express';
import {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctorDetails,
  updateClinicDetails,
  changePassword,
  editProfileImage,
  loginDoctor,
  checkProfileCompletion,
  getDoctorAmountById,
  handleVerfify,
  getopt
} from '../Controller/doctorController.js';

export const doctorRouter = express.Router();

// Add a new doctor
doctorRouter.post('/add', addDoctor);

// Get all doctors
doctorRouter.get('/getall', getAllDoctors); // admin protected

// Get doctor by ID
doctorRouter.get('/get/:id', getDoctorById);

doctorRouter.patch('/verify/:id', handleVerfify);

// Delete a doctor
doctorRouter.delete('/delete/:id', deleteDoctor);

// Update doctor details
doctorRouter.put('/update/:id', updateDoctorDetails);

// Update clinic details
doctorRouter.put('/update/clinic/:id', updateClinicDetails);

// Change password
doctorRouter.put('/update/password/:id', changePassword);

// Edit profile image
doctorRouter.put('/update/profile-image/:id', editProfileImage);

// doctor login
doctorRouter.post('/login', loginDoctor);
doctorRouter.post('/getotp', getopt);

doctorRouter.get('/checkprofile/:id', checkProfileCompletion);


doctorRouter.get('/get/wallet/:id', getDoctorAmountById);

