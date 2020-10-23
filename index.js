// =====================
// Libraries.
// =====================
const mongoose = require('mongoose');
require('./config/db');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const router = require('./routes');
const app = express();
require('dotenv').config({
    path: 'variables.env'
});
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);
const bodyParser = require('body-parser');
const flash = require("connect-flash");
const createError = require("http-errors")
const passport = require("./config/passport");

// =====================
// Middlewares.
// =====================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// We will use EJS as template engine.
app.use(expressLayouts);
app.set('view engine', 'ejs');
// Views path.
app.set('views', path.join(__dirname, './views'));
//Static files:
app.use(express.static('public'));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);;

//Alerts and flash messages
app.use(flash());

// Initialize passport for sessions
app.use(passport.initialize());
app.use(passport.session());

//Middleware (usuario logueado, flash messages).
app.use((req, res, next) => {
    res.locals.usuario = {
        ...req.user
    } || null
    res.locals.mensajes = req.flash();
    next();
});

// =====================
// Routes.
// =====================
app.use('/', router());

// =====================
// Let Heroku assign the port of the application
// Server and port
// =====================
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

app.listen(port, host, () => {
    console.log(`The server is working on the port ${ port } and the host ${ host }`);

});