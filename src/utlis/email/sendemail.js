import { emailtemplet ,forgotPasswordTemplateAr } from "../temblete/vervication.email.js";
import SibApiV3Sdk from "sib-api-v3-sdk";


export const sendemail = async ({
    to = [],
    subject = "",
    text = "",
    code = "",
    html = "",
} = {}) => {
    try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({
            email,
        }));

        const sendSmtpEmail = {
            sender: {
                email: process.env.SENDER_EMAIL,
                name: "progzila",
            },
            to: recipients,
            subject,
            textContent: text || "Verification Code",
            htmlContent: html || emailtemplet(code),
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("✅ Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error(error.response?.body || error.message);
        throw error;
    }
};



export const sendpassword = async ({
    to = [],
    subject = "",
    text = "",
    code = "",
    html = "",
} = {}) => {
    try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({
            email,
        }));

        const sendSmtpEmail = {
            sender: {
                email: process.env.SENDER_EMAIL,
                name: "progzila",
            },
            to: recipients,
            subject,
            textContent: text || "Forgot Password",
            htmlContent: html || forgotPasswordTemplateAr(code),
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("✅ Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error(error.response?.body || error.message);
        throw error;
    }
};