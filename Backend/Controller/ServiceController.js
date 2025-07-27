import { deleteBanner } from "../Utils/deletebanner.js";
import prisma from "../Utils/prismaclint.js";
import logError from "../Utils/log.js";

export const addService = async (req, res) => {
    try {

        const fileName = req?.file?.filename;

        if (!fileName) return res.status(502).json({ "error": "Unable To Upload Photo" });

        const { title, price, partnerId, isHomeServiceAvail } = req.body;

        if (!title || !price || !partnerId || !isHomeServiceAvail) {
            deleteBanner(fileName)
            return res.status(400).json({ "error": "All Fields Are Required" });
        }


        const partner = await prisma.partners.findUnique({
            where: {
                id: parseInt(partnerId)
            },
            include: {
                address: true
            }
        });

        if (!partner.isSubscribed) return res.status(400).json({ "error": "You have to buy a Subscription" })

        const result = await prisma.services.create({
            data: {
                title: title,
                price: price,
                banner_url: fileName,
                zoneId: partner.zoneId,
                partnerId: partner.id,
                isHomeServiceAvail: isHomeServiceAvail == 'true'
            }
        })



        if (!result) return res.status(500).json({ "error": "Unable to add Service" });
        return res.status(201).json({ "message": "Service Added Sucessfully" });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to add Service Internal Server error" });
    }
}

export const deleteService = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).json({ "error": "ID is Required" });

        await prisma.appointment.deleteMany({
            where: {
                service_id: +id
            }
        })

        const result = await prisma.services.delete({
            where: {
                id: +id
            }
        })

        if (result?.banner_url) {
            deleteBanner(result.banner_url);
        }

        if (!result) return res.status(404).json({ "error": "Service Not found" });
        return res.status(200).json({ "message": "Service Deleted Sucessfully" });
    } catch (error) {
        if (error.code == 'P2025') {
            return res.status(404).json({ "error": "Service Not Found" });
        }
        logError(error);
        return res.status(500).json({ "error": "Unable to Deleted Service Internal Server error" });
    }
}

export const getMyService = async (req, res) => {
    try {
        const id = req.params.partnerid

        const services = await prisma.services.findMany({
            where: {
                partnerId: parseInt(id)
            }
        })

        if (!services) return res.status(404).json({ "error": "Unable To Get Services" });
        return res.status(200).json({ "message": "Service Fetched Sucessfully", services: services });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Fetch Services Internal Server error" });
    }
}

export const getServiceByPartner = async (req, res) => {
    try {

        // const services = await

        // if (!services) return res.status(404).json({ "error": "Unable To Get Services" });
        // return res.status(200).json({ "message": "Service Fetched Sucessfully", services: services });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Fetch Services Internal Server error" });
    }
}

export const getPartnersByZone = async (req, res) => {
    try {

        const matchedCondition = {
            isSubscribed: true
        }



        if (req.query.state) {
            matchedCondition.zone = {
                is: {
                    state: {
                        equals: req.query.state,
                        mode: 'insensitive'
                    }
                }
            };
        }


        console.log(matchedCondition);

        const partner = await prisma.partners.findMany({
            where: matchedCondition,
            select: {
                id: true,
                hospitalName: true,
                services: true,
                email: true,
                address: true,
            }
        })

        if (!partner) return res.status(404).json({ "error": "Unable To Get Diagnosis Center" });
        return res.status(200).json({ "message": "Diagnosis Center Fetched Sucessfully", partner: partner });
    } catch (error) {
        logError(error);
        return res.status(500).json({ "error": "Unable to Fetch Diagnosis Center Internal Server error" });
    }
}
