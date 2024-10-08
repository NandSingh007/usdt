const mongoose = require("mongoose");

const CompanyProfileSchema = new mongoose.Schema({
  address: { type: String, required: true },
  paymentQRCharges1: { type: String }, // Path to the uploaded QR code file
  status: { type: Number, default: 0 } // Optional status field
});

const CompanyProfile = mongoose.model("CompanyProfile", CompanyProfileSchema);

module.exports = CompanyProfile;
