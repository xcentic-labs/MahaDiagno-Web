import axios from 'axios'

export const sentopt = async (phone_number) => {
    try {
        const res = await axios.get(`https://2factor.in/API/V1/${process.env.OTP_KEY}/SMS/+91${phone_number}/AUTOGEN2`)
        console.log(res.data)

        if (res.status == 200) {
            return {
                status: 200,
                sessionId: res.data.Details
            }
        }
        else {
            return {
                status: 500,
                sessionId: null
            }
        }
    } catch (error) {
        logError(error);
        return {
            status: 500,
            sessionId: null
        }
    }
}


export const verify2factorOtp = async (phone_number, OTP) => {
    try {
        const res = await axios.get(`https://2factor.in/API/V1/${process.env.OTP_KEY}/SMS/VERIFY3/${phone_number}/${OTP}`)
        console.log(res.data)

        if (res.status == 200 && res.data.Details == "OTP Matched") {
            return {
                status: 200,
                message : 'OTP Matched'
            }
        }
        else {
            return {
                status: 500,
                message : 'OTP Mismatch'
            }
        }
    } catch (error) {
        logError(error);
        return {
                status: 500,
                message : 'OTP Mismatch'
            }
    }
}