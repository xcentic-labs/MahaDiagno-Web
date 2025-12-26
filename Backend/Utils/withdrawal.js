import prisma from "./prismaclint.js";

export const withdrawalforpatner = async (status , id , partnerId , amount) => {
    if (status == 'REJECTED') {
        await prisma.partners.update({
            where: {
                id: +partnerId
            },
            data: {
                amount: {
                    increment: +amount
                }
            }
        })
    }


    const updatedWithdraw = await prisma.withdraw.update({
        where: { id: Number(id) },
        data: { status },
    });

    return updatedWithdraw;
}


export const withdrawalfordoctor = async (status , id , doctorId , amount) => {
    if (status == 'REJECTED') {
        await prisma.doctor.update({
            where: {
                id: +doctorId
            },
            data: {
                amount: {
                    increment: +amount
                }
            }
        })
    }


    const updatedWithdraw = await prisma.withdraw.update({
        where: { id: Number(id) },
        data: { status },
    });

    return updatedWithdraw;
}

export const withdrawalforvendor = async (status , id , pharmacyVendorId , amount) => {
    if (status == 'REJECTED') {
        await prisma.pharmacyVendor.update({
            where: {
                id: +pharmacyVendorId
            },
            data: {
                amount: {
                    increment: +amount
                }
            }
        })
    }


    const updatedWithdraw = await prisma.withdraw.update({
        where: { id: Number(id) },
        data: { status },
    });

    return updatedWithdraw;
}