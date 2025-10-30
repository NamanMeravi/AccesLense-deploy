import { transporter } from "./EmailService.js";

 export const SendVerificationEmail = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: 'namanmeravi0@gmail.com',
            to: email,
            subject: 'Verification Email',
            html: `Your verification code is ${verificationCode}`,
        });
        console.log("Email sent successfully", response.messageId);
         
    } catch (error) {
        console.log(error.message);
    }
}