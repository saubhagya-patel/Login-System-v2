import dotenv from 'dotenv';
// dotenv.config({path:"../.env"});
dotenv.config();
import nodemailer from "nodemailer";

const generateOtp = function () {
    const max = 999999;
    const min = 111111;
    let otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

async function initiateMail(transporter, mail) {
    try {
        const otp = generateOtp();
        await transporter.sendMail({
            from: {
                name: 'Saubhagya Patel',
                address: 'patelsaubhagya0144@gmail.com'
            },
            to: mail,
            subject: "OTP verification for app",
            text: `
                    Hello User,

                    Thank you for using our service! Your One-Time Password (OTP) is: ${otp}
                    
                    Please use this OTP to complete your action. Note that this is a one-time code and should not be shared with others.
                    
                    If you did not request this OTP or have any concerns, please contact our support team immediately.
                `,
            html: `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>OTP Email</title>
                    </head>
                    <body>
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1>Hello User,</h1>
                            <p>Thank you for using our service! Your One-Time Password (OTP) is:</p>
                            <p style="font-size: 24px; font-weight: bold; color: #007bff;" id="otpPlaceholder">${otp}</p>
                            <p>Please use this OTP to complete your action. Note that this is a one-time code and should not be shared with others.</p>
                            
                            <p>If you did not request this OTP or have any concerns, please contact our support team immediately.</p>
                        </div>
                    </body>
                    </html>
                `,
        });
        return otp;
    } catch (error) {
        console.log(error)
        return -1;
    }
}

async function initiatePasswordResetMail(transporter, mail) {
    try {
        const otp = generateOtp();
        await transporter.sendMail({
            from: {
                name: 'Saubhagya Patel',
                address: 'patelsaubhagya0144@gmail.com'
            },
            to: mail,
            subject: 'Password Reset OTP',
            text: `
Hello,

You are receiving this email because a password reset request was made for your account. If you did not make this request, please ignore this email.

Your OTP (One Time Password) for password reset is: ${otp}

This OTP is valid for 5 minutes.

Thank you,
Saubhagya Patel
`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Hello,</h1>
        <p>You are receiving this email because a password reset request was made for your account. If you did not make this request, please ignore this email.</p>
        <p>Your OTP (One Time Password) for password reset is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
        <p>This OTP is valid for 5 minutes.</p>
        <p>Thank you,<br>Saubhagya Patel</p>
    </div>
</body>
</html>
`,
        });
        return otp;
    } catch (error) {
        console.log(error);
        return -1;
    }
}


export async function sendMail(mail) {
    const otp = await initiateMail(transporter, mail);
    return otp;
}

export async function sendPasswordResetOtp(passwordResetMail) {
    const otp = await initiatePasswordResetMail(transporter, passwordResetMail);
    return otp;
}
