import { deleteBanner } from "../Utils/deletebanner.js";
import prisma from "../Utils/prismaclint.js";

export const addService = async (req,res)=>{
    try {

        const fileName = req?.file?.filename;

        if(!fileName) return res.status(502).json({"error" : "Unable To Upload Photo"});

        const {title , price } = req.body;

        

        if(!title || !price ){
            deleteBanner(fileName)
            return res.status(400).json({"error" : "All Fields Are Required"});
        }

        const result = await prisma.services.create({
            data : {
                title : title,
                price  : price,  
                banner_url : fileName
            }
        })

        if(!result) return res.status(500).json({"error" : "Unable to add Service"});
        return res.status(201).json({"message" : "Service Added Sucessfully"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({"error" : "Unable to add Service Internal Server error"});
    }
}

export const deleteService = async( req, res)=>{
    try {
        const id = req.params.id;

        if(!id) return res.status(400).json({"error" : "ID is Required"});

        const result = await prisma.services.delete({
            where : {
                id : +id
            }
        })

        if(result?.banner_url){
            deleteBanner(result.banner_url);
        }

        if(!result) return res.status(404).json({"error" : "Service Not found"});
        return res.status(200).json({"message" : "Service Deleted Sucessfully"});
    } catch (error) {
        if(error.code == 'P2025'){
            return res.status(404).json({"error" : "Service Not Found"}); 
        }
        console.log(error)
        return res.status(500).json({"error" : "Unable to Deleted Service Internal Server error"});
    }
}

export const getService = async (req , res)=>{
    try {
        const services = await prisma.services.findMany({})

        if(!services) return res.status(404).json({"error" : "Unable To Get Services"});
        return res.status(200).json({"message" : "Service Fetched Sucessfully" , services : services});
    } catch (error) {
        console.log(error);
        return res.status(500).json({"error" : "Unable to Fetch Services Internal Server error"});
    }
}