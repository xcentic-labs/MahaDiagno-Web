import prisma from "../Utils/prismaclint.js";


export const addZone =  async (req , res)=>{
    try {
        const {pincode ,district , state } = req.body

        if(!pincode || !district || !state) return res.status(400).json({"error" : "All fields are required"});

        if(pincode.length != 6)return res.status(400).json({"error" : "Pincode must be of 6 digit"});

        const result = await prisma.zone.create({
            data : {
                pincode : pincode,
                district : district,
                state : state
            }
        })

        if(!result) return res.status(500).json({"error" : "Unable to add the Zone"});
        return res.status(201).json({"message"  : "Zone Added Sucessfully"});
    } catch (error) {
        if(error.code == 'P2002') return res.status(409).json({"error" : "Zone Already Exist"});
        return res.status(500).json({"error" : "Unable to add the Zone Internal Server error"});
    }
}


// delete the zone
export const deleteZone = async (req , res)=>{
    try {
        const id = req.params.id

        if(!id) return res.status(400).json({"error" : "Id is required"});


        await prisma.serviceboy.deleteMany({
            where : {
                zoneId : +id
            }
        })

        const result = await prisma.zone.delete({
            where : {
                id : (+id)
            }
        });

        if(!result) return res.status(404).json({"error" : "Zone not found"});
        return res.status(200).json({"error" : "Zone Deleted Sucessfully"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({"error" : "Unable to delete the Zone Internal Server error"});     
    }
}


export const getZone = async (req , res)=>{
    try {
        const result = await prisma.zone.findMany({});

        if(!result) return res.status(500).json({"error" : "Unable to get Zones"});

        return res.status(200).json({"message" : "Zone Data" , ZoneData : result});

    } catch (error) {
        return res.status(500).json({"error" : "Unable to get Zones Internal Server error"});
    }
}



export const checkPincode = async (req , res) =>{
    try {
        const {pincode} = req.body
        console.log(req.body);
        
        if(!pincode) return res.status(400).json({"error" : "Pincode Is required"});

        const result = await prisma.zone.findUnique({
            where : {
                pincode : pincode
            }
        })

        console.log(result)

        if(!result) return res.status(404).json({"error" : "Not Matched Pincode Available"});
        return res.status(200).json({"message" : "Pincode Matched" , ZoneData : result});

    } catch (error) {
        return res.status(500).json({"error" : "Unable to get Zone Internal Server error"});
    }
}