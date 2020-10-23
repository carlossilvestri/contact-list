// =====================
// Libraries.
// =====================
const mongoose = require('mongoose');
const {
    body,
    check,
    validationResult
} = require('express-validator');
const Contacts = mongoose.model('Contacts');
const {
    sendEmail
} = require("../handlers/emails");

// =====================
// Middlewares.
// =====================
exports.newContact = async (req, res) => {
    // =====================
    //      Rules y Sanityze
    // =====================
    const rules = [
        // El nombre no puede estar vacio.
        check('firstname').notEmpty().trim().withMessage('Name is required').escape(),
        check('lastname').notEmpty().trim().withMessage('Last name is required').escape(),
        //Email no puede estar vacio, que  sea un email valido con @.
        check('email').notEmpty().trim().withMessage('Email is required').isEmail().withMessage('Please use a valid email').escape(),
        check('phone').notEmpty().trim().withMessage('Phone is required').escape()
    ];

    // =====================
    // Express Validations
    // =====================
    await Promise.all(rules.map(validation => validation.run(req)));
    const erroresExpress = validationResult(req);
    const errExp = erroresExpress.errors.map(err => err.msg);
    if (errExp.length > 0) {
        req.flash('error', errExp);
        res.redirect("/dashboard");
    } else {
        try {
            let contact = req.body;
            const idUser = req.user._id;
            contact.madeby = idUser;
            await Contacts.create(contact);
            await sendEmail({
                user: contact,
                subject: 'Your email was added',
                archivo: 'contact-added'
            });
            req.flash('exito', 'Contact was created.');

        } catch (error) {
            req.flash('error', error);
        }
        res.redirect("/dashboard");
    }
}
exports.deleteContact = async (req, res) => {
    const {
        id
    } = req.params;
    const contact = await Contacts.findById(id);
    if (contact) {
        if (verifyAuthor(contact, req.user)) {
            contact.remove();
            res.status(200).send('Contacto eliminado correctamente.');
        } else {
            //No allowed.
            res.status(403).send('Error, you are not allowed to delete this contact.');
        }
    } else {
        res.status(403).send('Error, contact was not found.');
    }

}
exports.showContactById = async (req, res) => {
    const {
        id
    } = req.params;
    const contact = await Contacts.findById(id);
    if (contact) {
        if (verifyAuthor(contact, req.user)) {
            res.render('contact', {
                estilosDshboard: true,
                contact
            });
        } else {
            //No allowed.
            res.status(403).send('Error.');
        }
    } else {
        res.status(403).send('That contact does not exist.');
    }

}
exports.editContactById = async (req, res) => {
    const {
        id
    } = req.params;
    const contactUpdated = req.body;
    contactUpdated.madeBy = id;
    await Contacts.findOneAndUpdate({
        _id: id
    }, contactUpdated, {
        new: true,
        runValidators: true
    });
    res.redirect('/dashboard');
}
/*
 =====================
        Function
 =====================
verifyAuthor: It lets you know if the user who delete the contact is who created it
Params: 1.- contact you want to delete. 2.- user: Actual session.
*/
const verifyAuthor = (contact = {}, usuario = {}) => {
    //Si no son iguales entonce retornar false
    if (!contact.madeby.equals(usuario._id)) {
        return false;
    }
    return true;
}