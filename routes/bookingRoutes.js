const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Booking = require('../models/Booking');

// Initialize Twilio (Wrapped in try-catch so the app doesn't crash if keys are missing yet)
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log("Twilio not configured yet. SMS will be skipped.");
}

// Set up Email Transporter (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST Route: Handle New Bookings
router.post('/new', async (req, res) => {
  try {
    const { name, phone, email, date, time } = req.body;

    // 1. Save the booking to MongoDB
    const newBooking = new Booking({ name, phone, email, date, time });
    await newBooking.save();

    // 2. Send Email Confirmation (if email credentials exist)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PhysioCare Appointment Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0ea5e9;">Appointment Confirmation</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your appointment is confirmed for <strong>${date}</strong> at <strong>${time}</strong>.</p>
            <p>If you need to reschedule or have any questions, please contact us.</p>
            <br/>
            <p>Best regards,<br/><strong>The Happyy Healing Hub Team</strong></p>
          </div>
        `
      };
      transporter.sendMail(mailOptions).catch(err => console.log("Email error:", err));
    }

    // 3. Send SMS Confirmation (if Twilio is set up)
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      twilioClient.messages.create({
        body: `Happyy Healing Hub: Hi ${name}, your appointment for ${date} at ${time} is confirmed. See you then!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      }).catch(err => console.log("SMS error:", err));
    }

    // 4. Send Success Response back to React
    res.status(201).json({ message: "Booking confirmed successfully", booking: newBooking });

  } catch (error) {
    console.error("Booking Route Error:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

module.exports = router;