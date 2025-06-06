export const generateFormatedRes = (appointment, usertype) => {
    console.log(usertype);
    return usertype == 'partner' ?

        {
            id: appointment.id,
            appointementId: `MH2025D${appointment.id}`,
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            partnerId : appointment.partnerId,
            IsSubscriptionBased : appointment.IsSubscriptionBased,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            isReportUploaded: appointment.isReportUploaded,
            reportName: appointment.reportName,
            isPaid: appointment.isPaid,
            modeOfPayment: appointment.modeOfPayment,
            bookedBy: {
                hospitalName: appointment.booked_by_partner.hospitalName,
                phoneNumber: appointment.booked_by_partner.phoneNumber,
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
        }
        :
        {
            id: appointment.id,
            appointementId: `MH2025D${appointment.id}`,
            patientFirstName: appointment.patient_first_name,
            patientLastName: appointment.patient_last_name,
            patientAge: appointment.patient_age,
            gender: appointment.gender,
            referringDoctor: appointment.referring_doctor,
            additionalPhoneNumber: appointment.additional_phone_number,
            userId: appointment.userId,
            partnerId : appointment.partnerId,
            IsSubscriptionBased : appointment.IsSubscriptionBased,
            serviceId: appointment.service_id,
            addressId: appointment.addressId,
            status: appointment.status,
            createdAt: appointment.createdAt,
            isReportUploaded: appointment.isReportUploaded,
            reportName: appointment.reportName,
            isPaid: appointment.isPaid,
            modeOfPayment: appointment.modeOfPayment,
            bookedBy: {
                firstName: appointment.booked_by_user.first_name,
                lastName: appointment.booked_by_user.last_name,
                phoneNumber: appointment.booked_by_user.phoneNumber
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
    id: true,
    patient_first_name: true,
    patient_last_name: true,
    patient_age: true,
    gender: true,
    referring_doctor: true,
    additional_phone_number: true,
    userId: true,
    partnerId: true,
    IsSubscriptionBased: true,
    service_id: true,
    addressId: true,
    status: true,
    createdAt: true,
    isReportUploaded: true,
    reportName: true,
    isPaid: true,
    modeOfPayment: true,
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