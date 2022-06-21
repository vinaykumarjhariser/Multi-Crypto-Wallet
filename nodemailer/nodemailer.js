const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: 'vinayjha1998@gmail.com',
        pass: 'hnlwhsuiygjounub'
    }

});

module.exports = transporter;