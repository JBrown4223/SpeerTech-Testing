var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    date: Date,
    message: String,
    likes: Number,
    retweets: Number,
    linkedTo: mongoose.Types.ObjectId
});

module.exports = userSchema;