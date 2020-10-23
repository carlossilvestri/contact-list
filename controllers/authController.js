const passport = require("passport");

exports.authUser = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Both inputs are required'
});
//Revisa si el usuario esta autenticado o no.
exports.userAuthenticated = (req, res, next) => {
    //Si el usuario esta autenticado, adelante.
    if (req.isAuthenticated()) {
        return next();
    }
    //Si no esta autenticado.
    return res.redirect('/login');
}
exports.logOut = (req, res, next) => {
    req.logout();
    req.flash('correcto', 'You logout.');
    return res.redirect('/login');
}
exports.goToLoginOrDashboard = (req, res, next) => {
    //Si el usuario esta autenticado, adelante.
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    //Si no esta autenticado.
    return res.redirect('/login');
}