const  mongoose = require('mongoose');
let SchemaTypes = mongoose.Schema.Types;

const usersModel = new mongoose.Schema({
    userName: String,
    userId: String,
    userAddress: String,
    userPhoneNumber: String
});

module.exports = mongoose.model('users', usersModel);