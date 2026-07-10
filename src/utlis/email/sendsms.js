import axios from "axios";

export async function sendOTP(phone, method = "whatsapp") {
    try {
        const response = await axios.post(
            `${process.env.URL_SENDSMS}/send-otp`,
            {
                method: method, // sms | whatsapp | email
                phone: phone,
              
                // must include + and country code e.g. +2010xxxxxxx
            },
            {
                headers: {
                    "x-rapidapi-key": process.env.API_SENDSMS,
                    "x-rapidapi-host": "authentica1.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        console.log("✅ OTP Sent Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "❌ Failed to Send OTP:",
            error.response?.data || error.message
        );
        throw error;
    }
}
