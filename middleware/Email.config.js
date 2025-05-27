import nodemailer from 'nodemailer'// Looking to send emails in production? Check out our Email API/SMTP product!

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 2525,
    auth: {
        user: "rahmanabdurr65@gmail.com",
        // user: "64a6e99ad0ae09",
        pass: "bc3152af3bf498"
    }
});