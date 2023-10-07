const nodemailer = require("nodemailer");

module.exports.sendMail = async function (data) {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
    });

    console.log(info)
}