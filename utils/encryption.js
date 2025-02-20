const crypto = require('crypto');

const ENC_KEY = process.env.ENC_KEY; // 16 bytes key for AES-128
const IV = process.env.IV;           // 16 bytes IV

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-128-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };

