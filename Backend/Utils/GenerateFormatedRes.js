export const generateFormatedRes = (appointment) => {
    return {
        id : appointment.id,
        appointementId : `MH2025D${appointment.id}`,
        patientFirstName: appointment.patient_first_name,
        patientLastName: appointment.patient_last_name,
        patientAge: appointment.patient_age,
        gender: appointment.gender,
        referringDoctor: appointment.referring_doctor,
        additionalPhoneNumber: appointment.additional_phone_number,
        userId: appointment.userId,
        serviceId: appointment.service_id,
        addressId: appointment.addressId,
        status: appointment.status,
        createdAt: appointment.createdAt,
        isReportUploaded: appointment.isReportUploaded,
        reportName: appointment.reportName,
        isPaid : appointment.isPaid,
        modeOfPayment : appointment.modeOfPayment,
        bookedBy: {
            firstName: appointment.booked_by.first_name,
            lastName: appointment.booked_by.last_name,
            phoneNumber: appointment.booked_by.phoneNumber
        },
        service: {
            title: appointment.serviceId.title,
            price: appointment.serviceId.price,
            bannerUrl: appointment.serviceId.banner_url
        },
        address: {
            area: appointment.address.area,
            landmark: appointment.address.landmark,
            pincode: appointment.address.pincode,
            district: appointment.address.district,
            state: appointment.address.state,
            lat: appointment.address.lat,
            lng: appointment.address.lng
        }
    };
}

export const fieldToBeSelected = {
    id : true,
    patient_first_name: true,
    patient_last_name: true,
    patient_age: true,
    gender: true,
    referring_doctor: true,
    additional_phone_number: true,
    userId: true,
    service_id: true,
    addressId: true,
    status: true,
    createdAt: true,
    isReportUploaded: true,
    reportName: true,
    isPaid : true,
    modeOfPayment : true,
    booked_by: {
        select: {
            first_name: true,
            last_name: true,
            phoneNumber: true
        }
    },
    serviceId: {
        select: {
            title: true,
            price: true,
            banner_url: true
        }
    },
    address: {
        select: {
            area: true,
            landmark: true,
            pincode: true,
            district: true,
            state: true,
            lat: true,
            lng: true
        }
    }
}