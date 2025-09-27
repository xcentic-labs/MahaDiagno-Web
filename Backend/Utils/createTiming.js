import prisma from './prismaclint.js';

const addTimingDetails = async (doctorId) => {
    try {
        const timings = await prisma.timings.createMany({
            data: [
                { day: 'Monday', doctorId },
                { day: 'Tuesday', doctorId },
                { day: 'Wednesday', doctorId },
                { day: 'Thursday', doctorId },
                { day: 'Friday', doctorId },
                { day: 'Saturday', doctorId },
                { day: 'Sunday', doctorId },
            ],
        });

        return timings;
    } catch (error) {
        console.error("Error creating timing details:", error);
        throw error;
    }
}

export default addTimingDetails;