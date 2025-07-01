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
import { OrderRouter } from './Router/OrderRouter.js';
import { SubscriptionRouter } from './Router/SubscriptionRouter.js';
import { PartnersRouter } from './Router/PartnersRouter.js';
import { SubscriptionPurchaseRouter } from './Router/subscriptionPurchaseRouter.js';

// cros 
import cors from 'cors'
import { createServer } from 'http'
import { initSocket } from './websocket/locationSocket.js';
import withdrawRouter from './Router/withdrawRoutes.js';
import paymentMethodRouter from './Router/paymentMethodRoutes.js';
import BannerRouter from './Router/BannerRouter.js';



const PORT = process.env.PORT || 8000;
const app = express();

export const server = createServer(app);
initSocket(server); 



app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'],
  credentials: true
}));

// data parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// statics serving of publuc folder
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.use('/api/v1/zone', ZoneRouter);
app.use('/api/v1/user', UserRouter);
app.use('/api/v1/service', ServiceRouter);
app.use('/api/v1/serviceboy', ServiceBoyRouter);
app.use('/api/v1/admin', AdminRouter);
app.use('/api/v1/address', AddressRouter);
app.use('/api/v1/appointment', AppointmentRouter);
app.use('/api/v1/order' , OrderRouter);
app.use('/api/v1/subscription' , SubscriptionRouter);
app.use('/api/v1/partners' , PartnersRouter);
app.use('/api/v1/subscriptionpurchase' , SubscriptionPurchaseRouter);
app.use('/api/v1/withdraw' , withdrawRouter)
app.use('/api/v1/paymentmethod' , paymentMethodRouter)
app.use('/api/v1/banner' , BannerRouter)


app.get('/', (req, res) => {
  return res.json({ "message": "Har har Mahadev" });
});

server.listen(PORT, () => {
  console.log(`Server started Sucessfully at ${PORT}`);
});