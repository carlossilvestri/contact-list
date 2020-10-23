const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const contactsSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: 'The first name is required',
        trim: true
    },
    lastname: {
        type: String,
        trim: true,
        required: 'The last name is required'
    },
    phone: {
        type: String,
        trim: true,
        required: 'The phone is required'
    },
    email: {
        type: String,
        unique: true,
        lowercase: true, // emails must be in lowercase
        trim: true,
        required: 'The email is required'
    },
    madeby: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: 'The user who made this contact is required'
    }
});
//Crear un indice. Utiliza los indices cuando quieras hacer una busqueda que pueda tener mas de un resultado tipo contacts cuando buscas un nombre, ejemplo carlos, pero tienes como 4 carlos guardados, entonces salen los 4.
contactsSchema.index({
    titulo: 'text'
});

module.exports = mongoose.model("Contacts", contactsSchema);