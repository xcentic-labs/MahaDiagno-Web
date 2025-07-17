import fs from 'fs'
import { __dirname } from '../index.js' // _dirname imported from the index.js
import logError from './log.js'
export const deleteBanner = (fileName)=>{    

    fs.unlink(`${__dirname}/public/servicebanner/${fileName}` , (error)=>{
        if(error){
            logError(error);
            return ;
        }
    })
}


export const deletePromotionalBanner = (fileName)=>{
    fs.unlink(`${__dirname}/public/banner/${fileName}` , (error)=>{
        if(error){
            logError(error);
            return ;
        }
    })
}