import { deleteBanner } from "../Utils/deletebanner.js";
import prisma from "../Utils/prismaclint.js";
import logError from "../Utils/log.js";

export const addService = async (req, res) => {
    try {

        const fileName = req?.file?.filename;

        console.log(req.body);

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

        let result;

        if (!fileName) {
            result = await prisma.services.create({
                data: {
                    title: title,
                    price: price,
                    partnerId: partner.id,
                    isHomeServiceAvail: isHomeServiceAvail == 'true'
                }
            });
        } else {
            result = await prisma.services.create({
                data: {
                    title: title,
                    price: price,
                    banner_url: fileName,
                    zoneId: partner.zoneId,
                    partnerId: partner.id,
                    isHomeServiceAvail: isHomeServiceAvail == 'true'
                }
            });
        }


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

        console.log(req.query);

        const userLat = parseFloat(req.query.latitude);
        const userLng = parseFloat(req.query.longitude);


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


        const distance = 100; // 100 km radius

        const partners = await prisma.partners.findMany({
            where: {
                isSubscribed: true,
            },
            select: {
                id: true,
                hospitalName: true,
                services: true,
                email: true,
                address: true,
                imageUrl: true,
            }
        });

        const toRad = (value) => (value * Math.PI) / 180;

        function getDistance(lat1, lng1, lat2, lng2) {
            const R = 6371; // Earth's radius in KM

            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c; // Distance in KM
        }

        // Step 3: Filter partners within 100 KM
        const nearbyPartners = partners.filter(p => {
            const dist = getDistance(
                userLat,
                userLng,
                p.address.lat,
                p.address.lng
            );
            return dist <= 100;
        });


        console.log(nearbyPartners);

        if (!partners) return res.status(404).json({ "error": "Unable To Get Diagnosis Center" });
        return res.status(200).json({ "message": "Diagnosis Center Fetched Sucessfully", partner: nearbyPartners });
    } catch (error) {
        console.log(error);
        logError(error);
        return res.status(500).json({ "error": "Unable to Fetch Diagnosis Center Internal Server error" });
    }
}
