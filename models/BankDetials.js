const { required } = require("joi");
const mongoose = require("mongoose");
const bankDetailsSchema = new mongoose.Schema({
  accountHolder: { type: String, required: true },
  accountNo: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
});

// Create a model
const BankDetailsdata = mongoose.model("BankDetailsdata", bankDetailsSchema);
module.exports = BankDetailsdata;
