// Import the Twilio library
const twilio = require('twilio');

// Your Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Replace with your Auth Token

// Create a Twilio client
const client = new twilio(accountSid, authToken);

// Function to send an SMS
const sendSms = async (otp) => {
  try {
    const message = await client.messages.create({
      body:`Your reset password code is ${otp}`,
      to: '+918580400595',     // The phone number you are sending the SMS to
      from: '+18312074556'  // Your Twilio phone number
    });
    console.log('Message sent:', message.sid);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};


module.exports = sendSms;
