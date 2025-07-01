import fs from 'fs'
import { __dirname } from '../index.js' // _dirname imported from the index.js

export const deleteBanner = (fileName)=>{
    console.log(fileName)    

    fs.unlink(`${__dirname}/public/servicebanner/${fileName}` , (error)=>{
        if(error){
            console.log(error);
            return ;
        }

        console.log("Photo delete Sucessfully");
    })
}


export const deletePromotionalBanner = (fileName)=>{
    console.log(fileName)    

    fs.unlink(`${__dirname}/public/banner/${fileName}` , (error)=>{
        if(error){
            console.log(error);
            return ;
        }

        console.log("Photo delete Sucessfully");
    })
}