const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const adminSchema = new Schema({
    adminEmail:{
        type:String
    },
    adminPassword:{
        type:String
    }
});
module.exports = mongoose.model("admin",adminSchema);