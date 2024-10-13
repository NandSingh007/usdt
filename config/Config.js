const crypto = require("crypto");

// API configuration details
const API_CRN = "IAM0028";
const API_MERCHANT_KEY = "8db13b25e168781643258016ff051dd7";
const API_MERCHANT_MID = "live_d1203b59cdce156d921cf0ba00d54650";
const API_PANTXN_URL =
  "https://apidashboard.inooze.in/api/VerificationSuite/v1/checkPan";

// Function to encrypt data using AES-128-CBC
// Function to encrypt data using AES-128-CBC
function encrypt(plainText, key) {
  const initVector = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f
  ]);

  // Ensure the key is 128 bits (16 bytes)
  const cipherKey = crypto.createHash("md5").update(key).digest();

  const cipher = crypto.createCipheriv("aes-128-cbc", cipherKey, initVector);

  let encryptedText = cipher.update(plainText, "utf8", "hex");
  encryptedText += cipher.final("hex");

  return encryptedText;
}

// Generate random API string
function generateRandomAPIString(length = 35) {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return randomString;
}

// Configuration object with various settings
const config = {
  baseUrl: "https://btuexchange.in",
  mongoURI:
    "mongodb+srv://worldpay472:jCdrzMW5M78BU1m5@cluster0.9pqtr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  port: 7500
};

// Export modules
module.exports = {
  API_CRN,
  API_MERCHANT_KEY,
  API_MERCHANT_MID,
  API_PANTXN_URL,
  encrypt,
  generateRandomAPIString,
  config
};
