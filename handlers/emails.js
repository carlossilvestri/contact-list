const nodemailer = require("nodemailer");
require('dotenv').config({
    path: 'variables.env'
});
const fs = require("fs");
const util = require("util");
const ejs = require('ejs');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAIL, // user
        pass: process.env.MAILPASSWORD // password
    }
});
// send mail with defined transport object
exports.sendEmail = async (opciones) => {
    //Leer el archivo para el email.
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;
    //Compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    let html;
    if (opciones.resetUrl) {
        html = compilado({
            resetUrl: opciones.resetUrl
        });
    } else {
        html = compilado();
    }
    //Configurar las opciones del email.
    let info = {
        from: 'Contact List <no-reply@contact.com>', // sender address
        to: opciones.user.email, // list of receivers
        subject: opciones.subject, // Subject line
        html
    };
    const enviarEmail = util.promisify(transporter.sendMail, transporter);
    return enviarEmail.call(transporter, info);

}