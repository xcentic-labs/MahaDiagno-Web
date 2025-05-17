import express from 'express';
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'

import { ZoneRouter } from './Router/ZoneRouter.js';
import { UserRouter } from './Router/UserRouter.js';
import { ServiceRouter } from './Router/ServiceRouter.js';
import { ServiceBoyRouter } from './Router/ServiceBoyRouter.js';
import { AdminRouter } from './Router/AdminRouter.js';
import { AddressRouter } from './Router/AddressRouter.js';
import { AppointmentRouter } from './Router/AppointmentRouter.js';


// cros 
import cors from 'cors'



const PORT = process.env.PORT || 8000;
const app = express();


app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// data parser
app.use(express.json());
app.use(express.urlencoded({extended : false}));

// statics serving of publuc folder
const __filename = fileURLToPath(import.meta.url);
export const __dirname =  path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.use('/api/v1/zone' , ZoneRouter);
app.use('/api/v1/user' , UserRouter );
app.use('/api/v1/service' , ServiceRouter);
app.use('/api/v1/serviceboy' , ServiceBoyRouter);
app.use('/api/v1/admin' , AdminRouter);
app.use('/api/v1/address' , AddressRouter);
app.use('/api/v1/appointment' , AppointmentRouter);


app.get('/' , (req,res)=>{
    return res.json({"message" : "Har har Mahadev"});
});

app.listen(PORT , ()=>{
    console.log(`Server started Sucessfully at ${PORT}`);
});