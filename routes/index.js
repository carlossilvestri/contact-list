// =====================
// Libraries.
// =====================
const express = require('express');
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");
const contactsController = require("../controllers/contactsController");
// =====================
// Routes module.
// =====================
module.exports = () => {
    /* HOME OR DASHBOARD */
    router.get('/', authController.goToLoginOrDashboard);
    /* LOGIN */
    router.get('/login', usuariosController.formIniciarSesion);
    router.post('/login', authController.authUser);
    /* FORGOT PASSWORD */
    router.get('/forgot-password', usuariosController.formForgotPassword);
    router.post('/forgot-password', usuariosController.sendToken);
    router.get('/reset-password/:token', usuariosController.restorePassword);
    router.post('/reset-password/:token', usuariosController.savePassword);
    /* CREATE AN ACCOUNT */
    router.get('/create-account', usuariosController.formCreateAccount);
    router.post('/create-account', usuariosController.createAccount);
    /* DASHBOARD */
    router.get('/dashboard', authController.userAuthenticated, usuariosController.formDashboard);
    /* CONTACTS */
    router.post('/new/contact', authController.userAuthenticated, contactsController.newContact);
    router.get('/contact/:id', authController.userAuthenticated, contactsController.showContactById);
    router.post('/edit-contact/:id', authController.userAuthenticated, contactsController.editContactById);
    router.get('/delete-contact/:id', authController.userAuthenticated, contactsController.deleteContact);
    /* LOGOUT */
    router.get('/logout', authController.userAuthenticated, authController.logOut);
    return router;
}