const passport = require('passport');
const LocalStrategy = require("passport-local");
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    const usuario = await Users.findOne({
        email
    });
    // console.log(usuario);
    if (!usuario) return done(null, false, {
        message: 'The email does not exist.'
    });
    //El usuario existe, vamos a verificarlo.
    const verificarPassword = usuario.compararPassword(password);
    if (!verificarPassword) {
        return done(null, false, {
            message: 'Incorrect password.'
        });
    }
    //El usuario existe y el password es correcto.
    return done(null, usuario);

}));
passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async (id, done) => {
    const usuario = await Users.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;