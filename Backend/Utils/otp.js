import axios from 'axios'
import 'dotenv/config'

// Test numbers (comma separated in .env) skip SMS and accept DEFAULT_OTP.
const lastTenDigits = (phone) => String(phone ?? '').replace(/\D/g, '').slice(-10)

const getTestNumbers = () =>
    (process.env.OTP_TEST_NUMBERS || '')
        .split(',')
        .map(lastTenDigits)
        .filter(Boolean)

export const isTestNumber = (phone_number) => getTestNumbers().includes(lastTenDigits(phone_number))

export const isTestOtp = (phone_number, OTP) =>
    isTestNumber(phone_number) && String(OTP) === (process.env.DEFAULT_OTP || '123456')

export const sentopt = async (phone_number) => {
    if (isTestNumber(phone_number)) {
        console.log(`Test number ${phone_number}: OTP not sent, use the default OTP`)
        return { status: 200, sessionId: 'test-session' }
    }

    try {
        const res = await axios.get(`https://2factor.in/API/V1/${process.env.OTP_KEY}/SMS/+91${phone_number}/AUTOGEN2/Authentication`)
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
        console.log(error);
        return {
            status: 500,
            sessionId: null
        }
    }
}


export const verify2factorOtp = async (phone_number, OTP) => {
    if (isTestNumber(phone_number)) {
        return isTestOtp(phone_number, OTP)
            ? { status: 200, message: 'OTP Matched' }
            : { status: 500, message: 'OTP Mismatch' }
    }

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
        console.log(error);
        return {
                status: 500,
                message : 'OTP Mismatch'
            }
    }
}