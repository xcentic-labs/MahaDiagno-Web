import prisma from "../Utils/prismaclint.js";
import logError from "../Utils/log.js";

export const addAddress = async (req, res) => {
    try {
        const { area, landmark, pincode, district, state, lat, lng , userId } = req.body

        if (!area || !landmark || !pincode || !district || !state ) return res.status(400).json({ "error": "All Fields Are Required" });

        const address = await prisma.address.create({
            data: {
                area: area,
                landmark: landmark,
                pincode: pincode,
                district: district,
                state: state,
                userId: userId ? userId : null,
                lat: lat.toString(),
                lng: lng.toString()
            }
        });

        if (!address) return res.status(500).json({ "error": "Unable To Add Address" });
        return res.status(201).json({ "message": "Address Added Sucessfully" , address : address });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Add Address Internal Server Error" });
    }
}

export const updateAddress = async (req, res) => {
    try {

        const id = req.params?.id

        if (!id) return res.status(400).json({ "error": "User ID Required" });

        const { area, landmark, pincode, district, state, lat, lng } = req.body

        if (!area || !landmark || !pincode || !district || !state) return res.status(400).json({ "error": "All Fields Are Required" });


        const address = await prisma.address.update({
            where: {
                id: +id
            },
            data: {
                area: area,
                landmark: landmark,
                pincode: pincode,
                district: district,
                state: state,
            }
        });

        if (!address) return res.status(500).json({ "error": "Unable To Update Address" });
        return res.status(200).json({ "message": "Address Updated Sucessfully" });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Update Address Internal Server Error" });
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const admin = await prisma.address.delete({
            where: {
                id: +id
            }
        })
        if (!admin) return res.status(500).json({ "error": "Unable To Delete  Address" });
        return res.status(200).json({ "message": "Address Deleted Sucessfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable To Delete Address Internal Server Error" });
    }
}

export const getAddress = async (req, res) => {
    try {

        const id = req.params.id

        if (!id) return res.status(400).json({ "error": "Id Is Required" });

        const address = await prisma.address.findMany({
            where: {
                userId: +id
            }
        });

        if (!address) return res.status(500).json({ "error": "Unable to get Address" });

        return res.status(200).json({ "message": "Address Data fetched Sucessfully", address: address });

    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to get Address Internal Server error" });
    }
}
