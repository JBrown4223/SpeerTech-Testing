const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const Stocks = new Schema({
    symbol: String,
    price: Number,
    exchange: String,
    sector: String

});

module.exports = Stocks