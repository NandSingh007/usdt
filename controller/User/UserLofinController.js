const jwt = require("jsonwebtoken");
// import jwt from "jsonwebtoken";
const {
  API_CRN,
  API_MERCHANT_KEY,
  API_MERCHANT_MID,
  API_PANTXN_URL,
  encrypt,
  generateRandomAPIString
} = require("../../config/Config");

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const emailjs = require("emailjs-com");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const formidable = require("formidable");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const userloginDatas = require("../../models/LofinUserDetail");
const {
  Types: { ObjectId }
} = require("mongoose");
const Admin_User = require("../../models/UserData");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

// const { JustCheck, ImgModel } = require("../../models/Justcheck");
const {
  ImgCollectiondata,
  NoticeCollectiondata
} = require("../../models/ImagesColletion");
const PackageData = require("../../models/PackageLoan");
const CompanyProfile = require("../../models/CompanyProfileSchema");
const LoginData = require("../../models/LoginModule");
const StepFormData = require("../../models/UserFormDetails");
// const jobDetails = require("../../models/JobDetails");
const JoDocuments = require("../../models/Stem3Form");
const LoanTypeDatas = require("../../models/LoanType");
const Step4Details = require("../../models/Step4Details");
const processingFeeData = require("../../models/ProcessingFee");
const SecurityData = require("../../models/secuirty");
const jobDetails = require("../../models/JobDetails");
const User = require("../../models/User");
const Registration = require("../../models/Registration");
const FileUpload = require("../../models/FileUpload");
const InsuranceBank = require("../../models/BankInsuranceType");
const FrontRegistrationData = require("../../models/registerfrontendModel");
const BankDetailsdata = require("../../models/BankDetials");
const Currency = require("../../models/currrencySchema");

dotenv.config();

exports.sendotp = async (req, res, next) => {
  try {
    let { userphone, userotp } = req.body;

    // Convert the phone number and OTP to numbers
    userphone = Number(userphone);
    userotp = Number(userotp);

    const response = await axios.get(
      `https://sms.bulksmslab.com/SMSApi/send?userid=gamezone&password=Royal@12&sendMethod=quick&mobile=${userphone}&msg=Your+OTP+is${userotp}for+Phone+Verification.OTPSTE&senderid=OTPSTE&msgType=text&duplicatecheck=true&output=json`
    );

    // console.log("SMS API Response:", response.data);

    res.json(response.data);
  } catch (error) {
    console.error("Error sending OTP:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request data:", error.request);
      res.status(500).json({ error: "No response received from SMS API" });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      res.status(500).json({ error: "Server error" });
    }
  }
};
exports.updateotp = async (req, res) => {
  try {
    const { id, otp, number } = req.body;
    // Find the user in the database
    const user = await LoginData.findOne({ _id: id, number: number });

    if (user) {
      // Update the user's OTP
      user.otp = otp;
      await user.save();

      // Generate a new token with only the userId
      const token = jwt.sign({ userId: user._id }, "j", {
        expiresIn: "30d"
      });

      // Send the new token in the response
      return res.status(200).json({ token });
    } else {
      // If the user does not exist, send a response accordingly
      return res
        .status(404)
        .json({ message: "User not found or OTP is incorrect" });
    }
  } catch (error) {
    console.error("Error in /update-otp:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.loginNumber = async (req, res) => {
  try {
    const { number, otp } = req.body;
    if (!number) {
      return res.status(400).json({ message: "User number is required" });
    }

    let user = await LoginData.findOne({ number: number });

    if (!user) {
      user = new LoginData({ number: number, otp: otp });
      await user.save();
    }

    // Generate a token that expires in 1 month
    const token = jwt.sign(
      { number: user.number, otp: user.otp, id: user._id },
      "j",
      {
        expiresIn: "30d"
      }
    );

    // Send the response with the token
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error in loginNumber:", error.message, error.stack);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.LoanTypes = async (req, res) => {
  try {
    const { loanType, interest, limit } = req.body;
    if (!loanType || !interest || !limit) {
      return res
        .status(400)
        .json({ message: "Loan Type, Interest, and Limit are required" });
    }
    const newLoan = new LoanTypeDatas({
      loanType,
      interest,
      limit
    });

    await newLoan.save();
    return res
      .status(200)
      .json({ message: "Loan added successfully", loan: newLoan });
  } catch (error) {
    console.error("Error adding loan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanTypeDatas.find(); // Adjust this query according to your database and schema
    res.status(200).json(loanTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch loan types", error: error.message });
  }
};

const fetchJobDetails = async (id) => {
  try {
    const jobDetails = await jobDetails.find({ userId: id });
    return jobDetails || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchJoDocuments = async (id) => {
  try {
    const joDocuments = await JoDocuments.find({ userId: id });
    return joDocuments || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchStepFormData = async (id) => {
  try {
    const stepFormData = await StepFormData.find({ userId: id });
    return stepFormData || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchLoanTypeDatas = async (id) => {
  try {
    const loanTypeDatas = await LoanTypeDatas.find({ userId: id });
    return loanTypeDatas || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

exports.deleteloan = async (req, res) => {
  const loanTypeId = req.params.id;

  try {
    const result = await LoanTypeDatas.findByIdAndDelete(loanTypeId);
    if (!result) {
      return res.status(404).send("Loan type not found");
    }
    res.send("Loan type deleted successfully");
  } catch (err) {
    res.status(500).send(err);
  }
};
exports.deletebank = async (req, res) => {
  const loanTypeId = req.params.id;

  try {
    const result = await InsuranceBank.findByIdAndDelete(loanTypeId);
    if (!result) {
      return res.status(404).send("Loan type not found");
    }
    res.send("Loan type deleted successfully");
  } catch (err) {
    res.status(500).send(err);
  }
};
// exports.UploadImgMulter1 = uploadicon.single("SliderImg");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  }
});

exports.deleteuser = async (req, res) => {
  try {
    const userId = req.params.Id;
    await Registration.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
// controllers/userController.js
exports.personalDetailsOfUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log(userId);
    // Find user details from the Registration collection using the userId
    const userRegistration = await Registration.find({ _id: userId });
    // console.log("User Registration:", userRegistration);
    if (userRegistration.length === 0) {
      // console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Find file upload details related to the user
    const userFileUploads = (await FileUpload.find({ userId: userId })) || [];
    console.log(userFileUploads, "userFileUploads");
    const loanType =
      userFileUploads.length > 0 ? userFileUploads[0].loanType : ""; // Ensure loanType is handled safely
    // console.log(loanType, "loanType");
    // loanType = "personal loan";
    // Fetch the loan type data from the LoanTypeDatas table
    const personalLoanTypes = [
      "Education", // Normalize to lowercase
      "Medicine", // Normalize to lowercase
      "Marriage", // Normalize to lowercase
      "Other"
    ];

    // Check if the selected loanType is a personal loan type
    const isPersonalLoan = personalLoanTypes.includes(loanType);

    // Set loanType to 'personal loan' if it's a personal loan type
    const finalLoanType = isPersonalLoan ? "personal loan" : loanType;

    const getloanData =
      (await LoanTypeDatas.find({ loanType: finalLoanType })) || [];
    console.log(getloanData, "getloanData");
    // Combine the data
    const response = {
      userRegistration: userRegistration[0] || {}, // Provide an empty object if no user found
      userFileUploads,
      getloanData
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching personal details:", error);
    res.status(500).json({ error: error.message });
  }
};

// module.exports = { personalDetailsOfUser };

exports.updateloantypefile = async (req, res) => {
  try {
    // Extract data from request body
    const { userId, loanType, limit, interest } = req.body;

    // Log received data for debugging

    // Validate required fields
    if (!userId || !loanType || !limit || !interest) {
      console.error("Validation failed: Missing required fields");
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Get the existing FileUpload record
    const fileUploadRecord = await FileUpload.findOne({
      userId: userId
    }).exec();
    if (!fileUploadRecord) {
      console.error("FileUpload record not found for userId:", userId);
      return res
        .status(404)
        .json({ success: false, message: "FileUpload record not found" });
    }

    // Update the record with the new data
    fileUploadRecord.loanType = loanType;
    fileUploadRecord.limit = limit;
    fileUploadRecord.interest = interest;

    // Save the updated record
    const updatedRecord = await fileUploadRecord.save();

    // Log the result of the database operation

    // Send a successful response
    res.json({ success: true, message: "Loan type updated successfully!" });
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating loan type:", error);

    // Send an error response
    res.status(500).json({
      success: false,
      message: "Error updating loan type",
      error: error.message
    });
  }
};
// exports.getSecurityFeeDataWithStatusZero = async (req, res) => {
//   try {
//     const dataWithStatusOne = await SecurityData.find({ Status: 0 });
//     res.status(200).json(dataWithStatusOne);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };

exports.getSecurityFeeDataWithStatusZero = async (req, res) => {
  try {
    // Fetch all documents with Status: 0
    const dataWithStatusZero = await SecurityData.find({ Status: 0 }).exec();

    // Reverse the order of the fetched data
    const reversedData = dataWithStatusZero.reverse();

    // Collect all userIds to process
    const userIds = reversedData.map((item) => item.userId);

    // Fetch FileUpload data based on userIds
    const fileUploads = await FileUpload.find({
      userId: { $in: userIds }
    }).select("userId limit loanType bankName");

    // Convert userIds to ObjectId for querying the Registration collection
    const objectIdUserIds = userIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch Registration data based on ObjectId userIds
    const registrations = await Registration.find({
      _id: { $in: objectIdUserIds }
    }).select("Username");

    // Create a map for quick lookup of FileUpload and Registration data by userId
    const fileUploadMap = fileUploads.reduce((map, item) => {
      map[item.userId] = {
        limit: item.limit,
        loanType: item.loanType,
        bankName: item.bankName
      };
      return map;
    }, {});
    // console.log(fileUploadMap, "fileUploadMap");
    const registrationMap = registrations.reduce((map, item) => {
      map[item._id.toString()] = item.Username;
      return map;
    }, {});

    // Enhance reversedData with limit, loanType, and username
    const enhancedData = reversedData.map((item) => ({
      ...item.toObject(),
      loanType: fileUploadMap[item.userId]?.loanType || null,
      bankName: fileUploadMap[item.userId]?.bankName || null,
      username: registrationMap[item.userId] || "Unknown"
    }));

    // Send response with enhanced data
    res.status(200).json(enhancedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// New method to fetch data where status is 1
// exports.getSecurityFeeDataWithStatusOne = async (req, res) => {
//   try {
//     const dataWithStatusOne = await SecurityData.find({ Status: 1 });
//     res.status(200).json(dataWithStatusOne);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };

exports.getSecurityFeeDataWithStatusOne = async (req, res) => {
  try {
    // Fetch all documents with Status: 1
    const dataWithStatusOne = await SecurityData.find({ Status: 1 });

    // Collect all userIds to process
    const userIds = dataWithStatusOne.map((item) => item.userId);

    // Fetch FileUpload data based on userIds
    const fileUploads = await FileUpload.find({
      userId: { $in: userIds }
    }).select("userId limit loanType");

    // Convert userIds to ObjectId for querying the Registration collection
    const objectIdUserIds = userIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch Registration data based on ObjectId userIds
    const registrations = await Registration.find({
      _id: { $in: objectIdUserIds }
    }).select("Username");

    // Create a map for quick lookup of FileUpload and Registration data by userId
    const fileUploadMap = fileUploads.reduce((map, item) => {
      map[item.userId] = { limit: item.limit, loanType: item.loanType };
      return map;
    }, {});

    const registrationMap = registrations.reduce((map, item) => {
      map[item._id.toString()] = item.Username;
      return map;
    }, {});

    // Enhance dataWithStatusOne with limit, loanType, and username
    const enhancedData = dataWithStatusOne.map((item) => ({
      ...item.toObject(),

      loanType: fileUploadMap[item.userId]?.loanType || null,
      username: registrationMap[item.userId] || "Unknown"
    }));

    // Send response with enhanced data
    res.status(200).json(enhancedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSecurityFeeDataWithStatusOneFront = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await SecurityData.findOne({ userId });
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json(error);
  }
};
// New method to fetch data where status is 1
// exports.getSecurityFeeDataWithStatusTwo = async (req, res) => {
//   try {
//     const dataWithStatusOne = await SecurityData.find({ Status: 2 });
//     res.status(200).json(dataWithStatusOne);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };
exports.stepfourdetails = async (req, res) => {
  try {
    const { loanType, amount, years, phone, Status, email, userId } = req.body;

    // Validate input
    if (
      !loanType ||
      !amount ||
      !years ||
      !phone ||
      !Status ||
      !email ||
      !userId
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if Step4Details exist and update or create
    let existingDetails = await Step4Details.findOne({ userId });
    if (existingDetails) {
      existingDetails.loanType = loanType;
      existingDetails.amount = amount;
      existingDetails.years = years;
      existingDetails.phone = phone;
      existingDetails.Status = Status;
      existingDetails.email = email;
      await existingDetails.save();
    } else {
      const newStep4Details = new Step4Details({
        loanType,
        amount,
        years,
        phone,
        email,
        userId,
        Status
      });
      await newStep4Details.save();
    }

    // Check if SecurityData exists and update or create
    let securityData = await SecurityData.findOne({ userId });
    if (securityData) {
      securityData.phone = phone;
      securityData.email = email;
      await securityData.save();
    } else {
      const newSecurityData = new SecurityData({
        phone,
        email,
        userId
      });
      await newSecurityData.save();
    }

    // Check if ProcessingFeeData exists and update or create
    let ProcessingFeeData = await processingFeeData.findOne({ userId });
    if (ProcessingFeeData) {
      ProcessingFeeData.phone = phone;
      ProcessingFeeData.email = email;
      await ProcessingFeeData.save();
    } else {
      const newProcessingFeeData = new processingFeeData({
        phone,
        email,
        userId
      });
      await newProcessingFeeData.save();
    }

    res.status(200).json({ message: "Step 4 details processed successfully" });
  } catch (error) {
    console.error("Error submitting step 4 details:", error);
    res.status(500).json({ error: "Error submitting step 4 details" });
  }
};
exports.step1Details = async (req, res) => {
  try {
    const { name, userId, email, phone, address, pinCode, fatherName } =
      req.body;
    // console.log(name, userId, email, phone, address, pinCode, fatherName);

    // Check if the user details already exist based on userId
    const existingDetails = await StepFormData.findOne({ userId });

    if (existingDetails) {
      // Update the existing details
      existingDetails.name = name;
      existingDetails.address = address;
      existingDetails.pinCode = pinCode;
      existingDetails.fatherName = fatherName;

      await existingDetails.save();
      return res
        .status(200)
        .json({ message: "User details updated successfully" });
    } else {
      // If no existing details, create a new instance of UserDetails
      const userDetails = new StepFormData({
        name,
        userId,
        email,
        phone,
        address,
        pinCode,
        fatherName
      });
      await userDetails.save();
      return res
        .status(200)
        .json({ message: "User details saved successfully" });
    }
  } catch (error) {
    console.error("Error saving user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.PackageDataController = async (req, res) => {
  try {
    const { LoanType, Intrest, Duration, status, Amount } = req.body;

    // Calculate MonthlyEmi
    const LoanAmount = parseFloat(Amount); // Assuming Amount is the loan principal
    const InterestRate = parseFloat(Intrest); // Assuming Intrest is the annual interest rate
    const LoanTenureMonths = parseFloat(Duration) * 12; // Assuming Duration is in years, convert to months

    const MonthlyEmi = calculateMonthlyEmi(
      LoanAmount,
      InterestRate,
      LoanTenureMonths
    );

    // Round MonthlyEmi to one decimal place
    const RoundedMonthlyEmi = Math.round(MonthlyEmi * 10) / 10; // Rounds to one decimal place

    // Check if the LoanType exists in a case-insensitive manner
    const existingData = await PackageData.findOne({
      LoanType: { $regex: new RegExp(`^${LoanType}$`, "i") }
    });

    if (!existingData) {
      // LoanType does not exist, insert the incoming data
      const newData = new PackageData({
        LoanType,
        Intrest,
        MonthlyEmi: RoundedMonthlyEmi, // Save rounded MonthlyEmi
        Amount,
        Duration,
        status
      });
      await newData.save();
      res
        .status(201)
        .json({ message: "Data inserted successfully", data: newData });
    } else {
      // LoanType exists, update the existing data
      const updatedData = await PackageData.findOneAndUpdate(
        { _id: existingData._id },
        {
          $set: {
            LoanType,
            Intrest,
            MonthlyEmi: RoundedMonthlyEmi,
            Duration,
            status,
            Amount
          }
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Data updated successfully", data: updatedData });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { LoanType, Amount, Interest, Duration } = req.body;

  // console.log("Received Data:", LoanType, Amount, Interest, Duration, id);

  // Calculate MonthlyEmi
  const LoanAmount = parseFloat(Amount);
  const InterestRate = parseFloat(Interest);
  const LoanTenureMonths = parseFloat(Duration) * 12;

  const MonthlyEmi = calculateMonthlyEmi(
    LoanAmount,
    InterestRate,
    LoanTenureMonths
  );

  // Round MonthlyEmi to one decimal place
  const RoundedMonthlyEmi = Math.round(MonthlyEmi * 10) / 10;

  try {
    // Find the package by ID and update it with the new data
    const updatedPackage = await PackageData.findByIdAndUpdate(
      id,
      {
        LoanType,
        Amount,
        Intrest: Interest,
        Duration,
        MonthlyEmi: RoundedMonthlyEmi
      },
      { new: true, runValidators: true } // This option returns the updated document and runs schema validators
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Log the updated package
    // console.log("Updated Package:", updatedPackage);

    res
      .status(200)
      .json({ message: "Package updated successfully", data: updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.DeletePackage = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id, "id");
    const deletedItem = await PackageData.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res
      .status(200)
      .json({ message: "Item deleted successfully", data: deletedItem });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Controller function
exports.updateCompanyProfile = async (req, res) => {
  try {
    const { address } = req.body;

    // Initialize an update object
    let updateFields = {};

    // Check address and add to update object if it's not null or undefined
    if (address) updateFields.address = address;

    // Check if the QR code file is present and add file path to updateFields
    if (req.files["paymentQRCharges1"]) {
      updateFields.paymentQRCharges1 = `/uploads/${req.files["paymentQRCharges1"][0].filename}`;
    }

    // Update or create the company profile document
    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      {}, // Assuming there's only one company profile document to update
      { $set: updateFields }, // Use $set to update only provided fields
      { new: true, upsert: true } // Return the updated document, create if it doesn't exist
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.CompanyProfileScn = async (req, res) => {
  try {
    const data = await CompanyProfile.find(
      {},
      "paymentQRCharges1 paymentQRCharges2 Signature logo"
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.FetchPackageDataController = async (req, res) => {
  try {
    const data = await PackageData.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.fetchCompanyProfile = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({});
    const InsuranceBan = await InsuranceBank.find({});

    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: companyProfile,
      InsuranceData: InsuranceBan ? InsuranceBan : []
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.EditName = async (req, res) => {
  try {
    const { id, username } = req.body;
    const updatedUser = await userloginDatas.findOneAndUpdate(
      { _id: id },
      { $set: { username: username } },
      { new: true }
    );
    if (updatedUser) {
      res
        .status(200)
        .json({ message: "Username updated successfully", updatedUser });
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePasswordfirst = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Convert password to string
    const passwordStr = String(password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(passwordStr, 10); // Salt rounds should be a number

    const count = await User.countDocuments();
    if (count === 0) {
      // If the collection is empty, insert a new document
      const newUser = new User({
        password: hashedPassword,
        username
      });
      await newUser.save();
      return res.status(201).json({ message: "User created successfully." });
    } else {
      // If the collection is not empty, update the existing document
      const result = await User.findOneAndUpdate(
        {},
        { password: hashedPassword, username }, // Update the document with new data
        { new: true } // Return the updated document
      );
      return res
        .status(200)
        .json({ message: "User updated successfully.", data: result });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.ChangeAdminPassword = async (req, res) => {
  try {
    const { username, CurrentPassword, NewPassword } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(CurrentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect Password");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NewPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.FetchPersonalUserdetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch company profile data for charges1 and charges2
    const companyProfile = await CompanyProfile.findOne(
      {},
      "charges1 charges2"
    );
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Fetch user details from the Registration table
    const registrationData = await Registration.findById(userId);
    if (!registrationData) {
      return res
        .status(404)
        .json({ message: "User not found in Registration table." });
    }

    // Fetch user file uploads from the FileUpload table
    const fileUploadData = await FileUpload.findOne({ userId: userId });
    if (!fileUploadData) {
      return res
        .status(404)
        .json({ message: "User not found in FileUpload table." });
    }

    // Extract the loanType from fileUploadData
    let { loanType } = fileUploadData;
    // loanType = "personal loan";
    // Fetch the loan type data from the LoanTypeDatas table
    const personalLoanTypes = [
      "Education", // Normalize to lowercase
      "Medicine", // Normalize to lowercase
      "Marriage", // Normalize to lowercase
      "Other"
    ];

    // Check if the selected loanType is a personal loan type
    const isPersonalLoan = personalLoanTypes.includes(loanType);

    // Set loanType to 'personal loan' if it's a personal loan type
    const finalLoanType = isPersonalLoan ? "personal loan" : loanType;

    let loanTypeData = {};
    if (loanType) {
      loanTypeData = await LoanTypeDatas.findOne({ loanType: finalLoanType });
    }
    console.log(loanTypeData);

    // Combine all data objects
    const userDetails = {
      ...registrationData.toObject(), // Convert Mongoose document to plain object
      ...fileUploadData.toObject(), // Convert Mongoose document to plain object
      loanTypeDetails: loanTypeData || {}, // Include an empty object if loanTypeData is not found
      charges1: companyProfile.charges1 || 0,
      charges2: companyProfile.charges2 || 0
    };

    // Respond with the combined user details
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
};
exports.FetchPersonalUserdetailsecondPage = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch company profile data for charges1 and charges2
    const companyProfile = await CompanyProfile.findOne(
      {},
      "charges1 charges2"
    );
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Fetch user details from the Registration table
    const registrationData = await Registration.findById(userId, "Username");
    if (!registrationData) {
      return res
        .status(404)
        .json({ message: "User not found in Registration table." });
    }

    // Fetch user file uploads from the FileUpload table
    const fileUploadData = await FileUpload.findOne({ userId: userId });
    if (!fileUploadData) {
      return res
        .status(404)
        .json({ message: "User not found in FileUpload table." });
    }

    // Extract the loanType from fileUploadData
    let { loanType } = fileUploadData;
    // loanType = "personal loan";
    // Fetch the loan type data from the LoanTypeDatas table
    // List of personal loan types (normalized to lowercase for comparison)
    const personalLoanTypes = [
      "Education", // Normalize to lowercase
      "Medicine", // Normalize to lowercase
      "Marriage", // Normalize to lowercase
      "Other"
    ];

    // Check if the selected loanType is a personal loan type
    const isPersonalLoan = personalLoanTypes.includes(loanType);

    // Set loanType to 'personal loan' if it's a personal loan type
    const finalLoanType = isPersonalLoan ? "personal loan" : loanType;

    let loanTypeData = {};
    if (loanType) {
      loanTypeData = await LoanTypeDatas.findOne({ loanType: finalLoanType });
    }
    // console.log(loanTypeData);

    // Combine all data objects
    const userDetails = {
      Username: registrationData.Username, // Include only the Username from Registration
      ...fileUploadData.toObject(), // Convert Mongoose document to plain object
      loanTypeDetails: loanTypeData || {}, // Include an empty object if loanTypeData is not found
      charges1: companyProfile.charges1 || 0,
      charges2: companyProfile.charges2 || 0
    };

    // Send the combined data as the response
    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
};

// exports.changePassword = async (req, res) => {
//   try {
//     const { CurrentPassword, NewPassword } = req.body;
//     console.log(
//       CurrentPassword,
//       NewPassword,
//       "changePasswordchangePasswordchangePasswordchangePassword"
//     );
//     // Find the user from the token or any identifier, assuming you have user ID from token
//     const userId = req.user.id; // Assuming req.user is set from middleware
//     if (!userId)
//       return res.status(400).json({ message: "User not authenticated" });

//     // Fetch the user from the database
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Check if the current password matches the stored password
//     if (CurrentPassword !== user.password) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Update the user with the new password
//     user.password = NewPassword; // Directly update the password without hashing
//     await user.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.register = async (req, res) => {
  const { phoneNumber, email, password, income, jobType, address, Username } =
    req.body;
  // console.log(phoneNumber, email, password, income, jobType, address, Username);
  try {
    // Check if user with the same email already exists
    let user;

    // Check if user with the same phone number already exists
    user = await Registration.findOne({ phoneNumber });
    if (user) {
      console.log("Phone number already exists");
      return res.status(400).json({ msg: "Phone number already exists" });
    }

    // Create a new user instance
    user = new Registration({
      phoneNumber,
      email,
      password,
      income,
      jobType,
      address,
      Username
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();
    console.log("User registered successfully");
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ msg: "Error registering user: " + error.message });
  }
};

// exports.frontsubmitForm = async (req, res) => {
//   try {
//     // Handle file uploads
//     const profilePhotoUpload = req.files["profilePhotoUpload"]
//       ? req.files["profilePhotoUpload"][0].buffer.toString("base64")
//       : null;
//     const adharcardFront = req.files["adharcardFront"]
//       ? req.files["adharcardFront"][0].buffer.toString("base64")
//       : null;
//     const adharcardBack = req.files["adharcardBack"]
//       ? req.files["adharcardBack"][0].buffer.toString("base64")
//       : null;
//     const pancardPhoto = req.files["pancardPhoto"]
//       ? req.files["pancardPhoto"][0].buffer.toString("base64")
//       : null;

//     // Handle bank details and other form fields
//     const adharcardNumber = req.body.adharcardNumber;
//     const pancardNumber = req.body.pancardNumber;
//     const loanAmount = req.body.loanAmount;
//     const duration = req.body.duration;
//     const loanType = req.body.loanType;
//     const capturedPhotoData = req.body.capturedPhotoData;

//     // New bank details fields
//     const bankName = req.body.bankName;
//     const accountNumber = req.body.accountNumber;
//     const ifscCode = req.body.ifscCode;
//     const accountType = req.body.accountType;

//     // Ensure userId is provided in the request body
//     const userId = req.body.userId;
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     // Fetch user data from Registration table
//     const userData = await Registration.findOne({ _id: userId });
//     if (!userData) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Insert email, phone, userId into processingFeeData table
//     const processingFeeDat = new processingFeeData({
//       email: userData.email,
//       phone: userData.phoneNumber,
//       userId: userData._id
//     });
//     await processingFeeDat.save();

//     // Insert email, phone, userId into SecurityData table
//     const securityData = new SecurityData({
//       email: userData.email,
//       phone: userData.phoneNumber,
//       userId: userData._id
//     });
//     await securityData.save();

//     // Define the update object with new bank details fields
//     const update = {
//       profilePhotoUpload,
//       adharcardFront,
//       adharcardBack,
//       pancardPhoto,
//       adharcardNumber,
//       pancardNumber,
//       loanAmount,
//       duration,
//       loanType,
//       capturedPhotoData,
//       bankName,
//       accountNumber,
//       ifscCode,
//       accountType
//     };

//     // Perform the upsert operation
//     await FileUpload.findOneAndUpdate(
//       { userId }, // Filter
//       { $set: update }, // Update
//       { upsert: true, new: true } // Options: create if not exists, return the new document
//     );

//     res
//       .status(200)
//       .json({ message: "Form submitted and files saved successfully!" });
//   } catch (error) {
//     console.error("Error saving form data:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while saving the form data." });
//   }
// };

exports.bankdetails = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const {
      bankName,
      HolderName,
      accountNumber,
      ifscCode,
      accountType,
      userId,
      insuranceamount
    } = req.body;
    console.log(
      bankName,
      HolderName,
      accountNumber,
      ifscCode,
      accountType,
      userId,
      insuranceamount,
      "fhdhdsfhdskfhdskfhdskfhdskfh"
    );
    // Validate input
    if (
      !bankName ||
      !HolderName ||
      !accountNumber ||
      !ifscCode ||
      !accountType ||
      !userId ||
      !insuranceamount
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    let statusOfBank = 1;
    // Find and update existing document
    const result = await FileUpload.findOneAndUpdate(
      { userId }, // Filter by userId
      {
        bankName,
        HolderName,
        accountNumber,
        ifscCode,
        accountType,
        statusOfBank,
        insuranceamount
      }, // Fields to update
      {
        new: true, // Return the updated document
        runValidators: true // Run validators for the updated fields
      }
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(result);
    res
      .status(200)
      .json({ message: "Bank details updated successfully", data: result });
  } catch (error) {
    console.error("Error handling bank details:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.frontsubmitForm = async (req, res) => {
  try {
    const {
      adharcardNumber,
      pancardNumber,
      loanAmount,
      duration,
      loanType,
      capturedPhotoData,
      userId
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    Registration.findOne({ _id: userId })
      .then((userData) => {
        if (!userData) {
          return res.status(404).json({ message: "User not found." });
        }

        const processingFeeDat = new processingFeeData({
          email: userData.email,
          phone: userData.phoneNumber,
          userId: userData._id
        });

        return processingFeeDat.save().then(() => userData);
      })
      .then((userData) => {
        const securityData = new SecurityData({
          email: userData.email,
          phone: userData.phoneNumber,
          userId: userData._id
        });

        return securityData.save().then(() => userData);
      })
      .then((userData) => {
        const update = {
          profilePhotoUpload: req.files["profilePhotoUpload"]
            ? `/uploads/${req.files["profilePhotoUpload"][0].filename}`
            : null,
          adharcardFront: req.files["adharcardFront"]
            ? `/uploads/${req.files["adharcardFront"][0].filename}`
            : null,
          adharcardBack: req.files["adharcardBack"]
            ? `/uploads/${req.files["adharcardBack"][0].filename}`
            : null,
          pancardPhoto: req.files["pancardPhoto"]
            ? `/uploads/${req.files["pancardPhoto"][0].filename}`
            : null,
          adharcardNumber,
          pancardNumber,
          loanAmount,
          duration,
          loanType,
          capturedPhotoData: capturedPhotoData ? capturedPhotoData : null,
          Status: 1
        };

        return FileUpload.findOneAndUpdate(
          { userId },
          { $set: update },
          { upsert: true, new: true }
        );
      })
      .then(() => {
        res
          .status(200)
          .json({ message: "Form submitted and files saved successfully!" });
      })
      .catch((error) => {
        console.error("Error saving form data:", error);
        res
          .status(500)
          .json({ message: "Error saving form data, please try again later." });
      });
  } catch (error) {
    console.error("Error processing the form:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.checkBankDetailsStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetching data with await to handle the asynchronous operation
    const data = await FileUpload.find({ userId: userId });
    console.log(data, "datadatadatadatadatadatadatadatadata");
    let statusformfill = 0;
    let statusbankformfill = 0;

    if (Array.isArray(data) && data.length > 0) {
      // Ensure there is at least one document in the array
      statusformfill = data[0].Status || 0; // Use default value if property is not present
      statusbankformfill = data[0].statusOfBank || 0; // Use default value if property is not present

      // Respond with the fetched data

      res
        .status(200)
        .json({ success: true, statusformfill, statusbankformfill });
    } else {
      // Respond with an error if no data is found
      res
        .status(404)
        .json({ success: false, message: "No data found for this user." });
    }
  } catch (error) {
    // Handle any errors that may occur
    console.error("Error fetching bank details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while checking bank details."
    });
  }
};

exports.frontloginform = async (req, res) => {
  const { userId } = req.body;
  console.log(userId, "userId");
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Assuming processingFeeData is a collection and you already have a connection to your database
    const user = await FileUpload.findOne({ userId: userId });
    console.log(user, "useruser");
    if (user) {
      // Assuming your user document has a field: status
      const { Status } = user;
      return res.status(200).json({ Status });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while checking the status" });
  }
};

// exports.frontlogin = async (req, res) => {
//   const { phoneNumber, password } = req.body;
//   console.log(phoneNumber, password);
//   try {
//     // Check if user with the phone number exists
//     let user = await Registration.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(400).json({ msg: "Invalid phone number or password" });
//     }

//     // Compare the provided password with the hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid phone number or password" });
//     }

//     // Check if processingFeeData and SecurityData exist for the user
//     const processingFeeDat = await processingFeeData.findOne({
//       phone: phoneNumber
//     });
//     // const id = processingFeeDat.userId;
//     console.log(processingFeeDat, "1586");
//     const securityData = await FileUpload.findOne({ userId: id });
//     console.log(securityData, "1588");
//     // const { userId } = securityData;
//     // console.log(processingFeeDat, securityData);
//     // If data is found, get statuses
//     let processingFeeStatus = null;
//     let securityStatus = null;

//     if (processingFeeDat) {
//       processingFeeStatus = processingFeeDat.Status;
//     }

//     if (securityData) {
//       securityStatus = securityData.Status;
//     }

//     // Generate JWT token
//     const token = jwt.sign({ user: { id: user.id } }, "hi", {
//       expiresIn: "2d"
//     });

//     // Return the token along with status if available
//     res.status(200).json({
//       token,
//       processingFeeStatus,
//       securityStatus
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ msg: "Error during login: " + error.message });
//   }
// };
exports.frontlogin = async (req, res) => {
  const { phoneNumber, password } = req.body;
  console.log(phoneNumber, password);

  try {
    // Check if user with the phone number exists
    let user = await Registration.findOne({ phoneNumber });

    // If user does not exist, respond with registration needed message
    if (!user) {
      return res.status(400).json({ msg: "Please register first" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Check if processingFeeData and SecurityData exist for the user
    const processingFeeDat = await processingFeeData.findOne({
      phone: phoneNumber
    });
    console.log(processingFeeDat, "processingFeeDat");
    const securityData = processingFeeDat
      ? await FileUpload.findOne({ userId: processingFeeDat.userId })
      : null;
    console.log("1644", securityData, "686868");

    // If data is found, get statuses
    let processingFeeStatus = 0;
    let securityStatus = 0;

    if (processingFeeDat) {
      processingFeeStatus = processingFeeDat.Status;
    }

    if (securityData) {
      securityStatus = securityData.Status;
    }
    // console.log(processingFeeStatus, "2269", securityStatus);

    // Generate JWT token
    const token = jwt.sign({ user: { id: user.id } }, "hi", {
      expiresIn: "2d"
    });

    // Return the token along with status if available
    res.status(200).json({
      msg: "Login successful",
      token,
      processingFeeStatus: processingFeeStatus,
      securityStatus: securityStatus
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Error during login: " + error.message });
  }
};

exports.forgotpasswordfront = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  try {
    // Check if the user exists
    let user = await Registration.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this phone number does not exist" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Save the updated user
    await user.save();
    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ msg: "Error resetting password: " + error.message });
  }
};

exports.editInsuramcetype = async (req, res) => {
  try {
    console.log("hi");

    const { id } = req.params; // Get the loan ID from request parameters
    const { banktype, insuranceamount } = req.body; // Destructure the data from the request body
    console.log(banktype, insuranceamount, id);
    // Check if the request has an image uploaded
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store image file path if uploaded

    // Create an update object
    const updateData = {
      banktype,
      insuranceamount
    };

    // Only update the image if a new one was uploaded
    if (image) {
      updateData.image = image;
    }

    // Update the loan data in the database
    const updatedLoan = await InsuranceBank.findByIdAndUpdate(id, updateData, {
      new: true
    });

    // Check if the loan data was found and updated
    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Respond with success and the updated data
    res.json({ message: "Insurance loan updated successfully", updatedLoan });
  } catch (error) {
    // Handle errors
    console.error("Error updating insurance loan:", error);
    res.status(500).json({ message: "Failed to update insurance loan", error });
  }
};

exports.BankDetailsadd = async (req, res) => {
  try {
    // Extract form data and uploaded file
    const { banknameadd, insuranceamountadd } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store image file path if uploaded
    console.log(image, "hkhhk");
    // Check if the image is uploaded
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Create a new InsuranceBank entry
    const newInsuranceBank = new InsuranceBank({
      banktype: banknameadd,
      insuranceamount: insuranceamountadd,
      image: image // Save the file path in the image field
    });

    // Save to database
    await newInsuranceBank.save();

    // Send success response
    res.status(201).json({ message: "Insurance bank data added successfully" });
  } catch (error) {
    console.error("Error adding insurance bank data:", error);
    res.status(500).json({ error: "Failed to add insurance bank data" });
  }
};

// Controller to fetch insurance bank data
exports.getInsuranceBanks = async (req, res) => {
  try {
    const insuranceBanks = await InsuranceBank.find();
    res.status(200).json(insuranceBanks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch insurance bank data" });
  }
};
exports.login = async (req, res) => {
  const { username, password } = req.body;
  // console.log(username, password);
  try {
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    console.log(user);
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // console.log(isMatch);
    const token = jwt.sign({ id: user._id, username: user.username }, "king", {
      expiresIn: "1h"
    });

    // Send token in HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Cookie expires in 1 hour

    // Respond with success message
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller function to handle registration
exports.registerfrontendData = async (req, res) => {
  const { name, phone, email, aadharcard, address } = req.body;
  console.log(name, phone, email, aadharcard, address);

  try {
    // Check if user with same email, pancard or aadharcard already exists
    const existingUser = await FrontRegistrationData.findOne({
      $or: [{ email }, { aadharcard }]
    });

    if (existingUser) {
      let duplicateField = "";
      if (existingUser.email === email) {
        duplicateField = "Email";
      } else if (existingUser.aadharcard === aadharcard) {
        duplicateField = "Aadharcard";
      }
      return res.status(400).json({
        message: `${duplicateField} already exists. Please provide unique information.`
      });
    }

    // If no duplicate found, create new user
    const newUser = new FrontRegistrationData({
      name,
      phone,
      email,

      aadharcard,
      address
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration Successful!",
      user: {
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        aadharcard: newUser.aadharcard,
        address: newUser.address
      }
    });
  } catch (error) {
    // Handle any server or database errors
    console.error("Registration Error:", error.message);

    // Check if it's a MongoDB duplicate key error
    if (error.code === 11000) {
      let duplicateKey = Object.keys(error.keyValue)[0]; // Get which field caused the error
      return res.status(400).json({
        message: `Duplicate value detected in the ${duplicateKey} field. Please provide a unique value.`
      });
    }

    res.status(500).json({ message: "Server Error. Please try again later." });
  }
};

// Configure Nodemailer transporter

// Function to send OTP email

// Route Handler: Send OTP
// Assuming you have a secret key for signing tokens

const JWT_SECRET = "your_jwt_secret"; // Replace with your actual secret

exports.sendotp2 = async (req, res) => {
  const { email } = req.body;

  // Basic validation
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Find user by email
    const user = await FrontRegistrationData.findOne({
      email: email
    });

    if (!user) {
      return res.status(400).json({ message: "Email not registered." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 750000).toString(); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Update user with OTP and expiration
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d" // Token expires in 1 day
    });

    // Optionally send the OTP via email
    // await sendOtpEmail(user.name, user.email, otp);

    res.status(200).json({
      message: "OTP sent successfully.",
      name: user.name,
      email: user.email,
      otp: otp,
      token: token // Send token in the response
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
exports.verifyotp2 = async (req, res) => {
  const { token, otp } = req.body;

  // Basic validation
  if (!token || !otp) {
    return res.status(400).json({ message: "Token and OTP are required." });
  }

  try {
    // Verify JWT token
    // console.log(token);
    const decoded = jwt.verify(token, "your_jwt_secret");
    // console.log(decoded, "decoded");
    const userId = decoded.id;
    // console.log(userId);

    // Find user by ID
    const user = await FrontRegistrationData.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token." });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // OTP is valid. Clear OTP fields.
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Optionally, generate a new JWT token for the session
    const newToken = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "1d" // e.g., '1d'
    });

    res
      .status(200)
      .json({ message: "OTP verified successfully.", token: newToken });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Token has expired. Please request a new OTP." });
    }
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
};
exports.pancardDetailData = async (req, res) => {
  const { txtPANNo } = req.body; // Assuming PAN number is passed in the body
  try {
    const orderId = generateRandomAPIString();
    const payloadData = JSON.stringify({ pan: txtPANNo });
    // console.log(payloadData, "payloadData");

    const encryptedData = encrypt(payloadData, API_MERCHANT_KEY);
    // console.log(encryptedData, "encryptedData");
    // console.log(API_MERCHANT_KEY, "API_MERCHANT_KEY");

    const postData = {
      encRequest: encryptedData,
      requestId: orderId,
      merchantCRN: API_CRN
    };
    // console.log(postData, "postData");

    // Log the request data and headers before sending
    // console.log("Sending to API:", JSON.stringify(postData, null, 2));
    // console.log("Headers:", {
    //   "Content-Type": "application/json",
    //   "inooze-mid": API_MERCHANT_MID
    // });

    // Call the external API using axios
    const response = await axios.post(API_PANTXN_URL, postData, {
      headers: {
        "Content-Type": "application/json",
        "inooze-mid": API_MERCHANT_MID
      }
    });

    // console.log(response.data, "response.data"); // Check the actual response data here

    // Ensure the response data is not empty or malformed
    if (!response.data || Object.keys(response.data).length === 0) {
      console.error("API returned an empty or malformed response.");
      return res.status(502).json({ error: "Invalid response from API" });
    }

    // Send the response data with a 200 status code
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in API call:", error.message);

    // Send a 500 error status with a proper error message
    res.status(500).send("Error processing request");
  }
};

// Controller to fetch and return all user data
exports.userDetailDataReg = async (req, res) => {
  try {
    // Fetch users with pagination
    const users = await FrontRegistrationData.find();

    res.status(200).json({
      message: "Users fetched successfully.",
      data: users
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server Error. Please try again later." });
  }
};
// Controller
// exports.bankdetailsblock = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { accountHolder, accountNo, ifscCode, bankName } = req.body;
//     const newBankDetails = new BankDetailsdata({
//       accountHolder,
//       accountNo,
//       ifscCode,
//       bankName
//     });
//     await newBankDetails.save();
//     res.status(201).json({ message: "Bank details submitted successfully!" });
//   } catch (error) {
//     console.error("Error saving bank details:", error);
//     res.status(500).json({ message: "Error saving bank details" });
//   }
// };

exports.bankdetailsblock = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1]; // 'Bearer <token>'

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Decrypt/verify the token
    const decoded = jwt.verify(token, JWT_SECRET); // Ensure your secret is in environment variables

    // Extract userId from the decoded token
    const Id = decoded.userId; // Ensure your token contains the _id as userId
    // console.log(Id);
    // Fetch user information using the userId
    const user = await FrontRegistrationData.findById(Id).select("email phone"); // Adjust fields based on your user schema
    console.log(user, "user");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract bank details from request body
    const { accountHolder, accountNo, ifscCode, bankName } = req.body;

    // Create a new bank details entry
    const newBankDetails = new BankDetailsdata({
      accountHolder,
      accountNo,
      ifscCode,
      bankName,
      email: user.email, // Include user's email
      phone: user.phone // Include user's phone
    });

    // Save the bank details to the database
    await newBankDetails.save();

    // Respond with a success message
    res.status(201).json({ message: "Bank details submitted successfully!" });
  } catch (error) {
    console.error("Error saving bank details:", error);
    res.status(500).json({ message: "Error saving bank details" });
  }
};

// Controller to fetch bank details
exports.getBankDetails = async (req, res) => {
  let { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
  page = parseInt(page);
  limit = parseInt(limit);

  try {
    const totalBankDetails = await BankDetailsdata.countDocuments();
    const totalPages = Math.ceil(totalBankDetails / limit);

    // Fetch bank details with pagination
    const bankDetails = await BankDetailsdata.find()
      .sort({ _id: -1 }) // Sort by newest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Bank details fetched successfully.",
      data: bankDetails,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching bank details:", error);
    res.status(500).json({ message: "Error fetching bank details" });
  }
};

exports.currecyChange = async (req, res) => {
  const { usdt, inr } = req.body;

  try {
    // Check if any document exists in the Currency collection
    const existingCurrency = await Currency.findOne({});

    if (existingCurrency) {
      // If a currency document exists, update it
      existingCurrency.usdt = usdt; // Update the USDT value
      existingCurrency.inr = inr; // Update the INR value
      const updatedCurrency = await existingCurrency.save();
      return res
        .status(200)
        .json({ message: "Data updated successfully", data: updatedCurrency });
    } else {
      // If no document exists, create a new one
      const newCurrency = new Currency({
        usdt: usdt,
        inr: inr
      });
      const savedCurrency = await newCurrency.save();
      return res
        .status(201)
        .json({ message: "Data inserted successfully", data: savedCurrency });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

exports.getCurrencyData = async (req, res) => {
  try {
    // Fetch the existing currency data from the Currency collection
    const currencyData = await Currency.findOne({});

    if (currencyData) {
      // If data exists, return it
      return res
        .status(200)
        .json({ message: "Data fetched successfully", data: currencyData });
    } else {
      // If no data exists, return a message indicating no data
      return res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    // Handle any errors during the fetching process
    return res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
};
