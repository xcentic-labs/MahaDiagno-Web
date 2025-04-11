import express from 'express';
import 'dotenv/config'
import { ZoneRouter } from './Router/ZoneRouter.js';
import { UserRouter } from './Router/UserRouter.js';


const PORT = process.env.PORT || 8000;
const app = express();


// data parser
app.use(express.json());


// routes
app.use('/api/v1/zone' , ZoneRouter);
app.use('/api/v1/user' , UserRouter )


app.get('/' , (req,res)=>{
    return res.json({"message" : "Har har Mahadev"});
});

app.listen(PORT , ()=>{
    console.log(`Server started Sucessfully at ${PORT}`);
});