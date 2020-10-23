// =====================
// Libraries.
// =====================
const mongoose = require('mongoose');
const {
    body,
    check,
    validationResult
} = require('express-validator');
const Users = mongoose.model('Users');
const Contacts = mongoose.model('Contacts');
const crypto = require('crypto');
const {
    sendEmail
} = require("../handlers/emails");

// =====================
// Middlewares.
// =====================
exports.formIniciarSesion = (req, res) => {
    res.render('login', {
        estilosDshboard: false
    });
}
exports.formForgotPassword = (req, res) => {
    res.render('forgot-password', {
        estilosDshboard: false
    });
}
exports.formCreateAccount = (req, res) => {
    res.render('create-account', {
        estilosDshboard: false
    });
}

exports.formDashboard = async (req, res) => {
    const contactos = await Contacts.find({
        'madeby': req.user._id
    });
    const contactsCant = contactos.length;
    res.render('dashboard', {
        estilosDshboard: true,
        contactos,
        contactsCant
    });
}

exports.createAccount = async (req, res) => {
    const usuario = req.body;
    //**************Reglas y Sanityze****************//
    const rules = [
        // El nombre no puede estar vacio.
        check('name').notEmpty().trim().withMessage('Name is required').escape(),
        check('lastname').notEmpty().trim().withMessage('Last name is required').escape(),
        //Email no puede estar vacio, que  sea un email valido con @.
        check('email').notEmpty().trim().withMessage('Email is required').isEmail().withMessage('Ingresa un email válido').escape(),
        // password must be at least 5 chars long
        check('password').notEmpty().withMessage('Password is required').isLength({
            min: 5
        }).withMessage('Password must be longer than 5 characters.').matches(/\d/).withMessage('Password must have at least a number').escape(),
        check("repeatpassword").notEmpty().withMessage('Repeat the password is required').escape(),
        check('repeatpassword').equals(req.body.password).withMessage('The passwords are not the same.')
    ]
    //***********Ejecutar Validaciones Express***********/
    await Promise.all(rules.map(validation => validation.run(req)));
    // Meter en "errores" los errores de Express-Validator
    const erroresExpress = validationResult(req);
    const errExp = erroresExpress.errors.map(err => err.msg);
    if (errExp.length > 0) {
        req.flash('error', errExp);
        res.redirect('/create-account');
    } else {
        try {
            await Users.create(usuario);
            req.flash('exito', 'User was created.')
            res.redirect("/login");
        } catch (error) {
            req.flash('error', error);
            res.redirect('/create-account');

        }
    }

}

// =====================
// sendToken. This middleware sends an email and creates two fields in the DB expire and token
// =====================
exports.sendToken = async (req, res, next) => {
    //Verificar que el usuario exista
    const user = await Users.findOne({
        email: req.body.email
    });
    //Si el user no existe.
    if (!user) {
        req.flash("error", 'That account does not exist');
        return res.redirect("back");
    }
    //El user existe generar token.
    user.token = crypto.randomBytes(20).toString('hex');
    user.expira = Date.now() + 3600000;
    //Guardar el user
    await user.save();
    const resetUrl = `http://${req.headers.host}/reset-password/${user.token}`;
    // console.log(resetUrl);
    // Enviar notificacion por email
    await sendEmail({
        user,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    //Todo correcto

    req.flash('correcto', 'Check your email for more details');
    res.redirect("/login");
}
exports.restorePassword = async (req, res, next) => {
    const user = await Users.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        } //$gt greater than
    });
    if (!user) {
        req.flash('error', 'Token expired.');
        return res.redirect("/login");
    }
    // All okay
    res.render('newpassword', {
        nombrePagina: 'New password',
        estilosDshboard: true
    });
}
exports.savePassword = async (req, res) => {
    const user = await Users.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        } //$gt greater than
    });
    if (!user) {
        req.flash('error', 'Token expired.');
        return res.redirect("/login");
    }
    //Asignar nuevo password, limpiar valores previos.
    user.password = req.body.password;
    user.token = undefined;
    user.expira = undefined;
    //Agregar y eliminar valores del objeto.
    await user.save();
    //Redirigir
    req.flash('correcto', 'The password was changed.');
    res.redirect('/login');

}