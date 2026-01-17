const nodemailer = require('nodemailer');

console.log('Nodemailer object:', nodemailer);
console.log('createTransport exists?', typeof nodemailer.createTransport);

if (typeof nodemailer.createTransport === 'function') {
  console.log('✅ Nodemailer is working correctly!');
} else {
  console.log('❌ Nodemailer is broken!');
}
