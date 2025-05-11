import express from 'express';
import { addAddress, deleteAddress, getAddress, updateAddress } from '../Controller/AddressController.js';



export const AddressRouter = express.Router();

AddressRouter.post('/addaddress' , addAddress);
AddressRouter.put('/updateaddress/:id' , updateAddress);
AddressRouter.delete('/deleteaddress/:id' , deleteAddress);
AddressRouter.get('/getaddress/:id', getAddress);
