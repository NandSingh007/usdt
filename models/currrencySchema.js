const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema({
  usdt: Number,
  inr: Number
});

// Create a model for the currency data
const Currency = mongoose.model("Currency", currencySchema);

module.exports = Currency;
