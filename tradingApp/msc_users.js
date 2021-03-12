const mongoose = require("mongoose");


var Schema = mongoose.Schema;

const User = new Schema({
    username: { type : String , unique : true, required : true },
    password: { type : String , unique : true, required : true },
    email: { type : String , unique : true, required : true },
    outflows: Number,
    balance: Number,
    holdings: Array

});


module.exports = User;

