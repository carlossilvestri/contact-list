const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");


//Lo que le vas a enviar a la instancia de mongoose.
const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'The name is required'
    },
    lastname: {
        type: String,
        required: 'The last name is required'
    },
    email: {
        type: String,
        unique: true,
        lowercase: true, //los correos deben estar en MINUSCULAS
        trim: true,
        required: 'The email is required'
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date
});

//Metodo para hashear los passwords
//pre es de mongoose. Lo que hace es una accion antes de guardar algo.
usersSchema.pre('save', async function (next) {
    //Si el password ya esta hasheado, no hacemos nada
    if (!this.isModified('password')) {
        return next(); //Deten la ejecucion y continua con el siguiente middleware
    }
    //Si no esta hasheado
    /* 
    FUNCION
    hash(param1, param2);
    param1: lo que vas a hashear (string),
    param2: el costo, que tan dificil necesitas que sea el hash. Generalmente se deja en 10 o 12.
    Entre mayor es el costo, mas peso tendra en la BD.
     */
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});
//Envia una alerta cuando un email ya esta registrado
usersSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code == 11000) {
        next('That email is already registered');
    } else {
        next(error);
    }
});
//Autenticar users.
usersSchema.methods = {
    compararPassword: function (password) {
        return bcrypt.compareSync(password, this.password)
    }
}

//Se le envia todo a mongoose.
module.exports = mongoose.model('Users', usersSchema);