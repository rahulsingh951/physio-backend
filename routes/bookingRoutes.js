const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');

// 1. Configure the Hostinger Email Transporter (with Debugging turned ON)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Tells Nodemailer to log every step
  logger: true // Logs information to the console
});

// 2. Test the connection immediately when the server starts
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ Nodemailer successfully connected to Hostinger!");
  }
});

router.post('/new', async (req, res) => {
  try {
    console.log("📥 Received new booking data from frontend:", req.body); // Shows us what the frontend sent

    // 3. Save the booking
    const newBooking = new Booking(req.body);
    await newBooking.save();
    console.log("✅ Booking saved to MongoDB.");

    // 4. Draft the Patient Email
    const patientMailOptions = {
      from: process.env.EMAIL_USER, // Kept as pure email string to prevent Hostinger blocking it
      to: req.body.email, 
      subject: 'Booking Confirmation - Happy Healing Hub',
      html: `
        <h3>Hello ${req.body.name},</h3>
        <p>Thank you for choosing Happy Healing Hub.</p>
        <p>Your appointment request has been successfully received. We will contact you shortly to confirm the exact time.</p>
        <br>
        <p>Warm Regards,<br>The Happy Healing Hub Team</p>
      `
    };

    // 5. Draft the Clinic Notification Email
    const clinicMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, 
      subject: `🚨 New Patient Booking: ${req.body.name}`,
      html: `
        <h3>New Booking Received!</h3>
        <ul>
          <li><strong>Name:</strong> ${req.body.name}</li>
          <li><strong>Email:</strong> ${req.body.email}</li>
          <li><strong>Phone:</strong> ${req.body.phone}</li>
          <li><strong>Message:</strong> ${req.body.message || 'N/A'}</li>
        </ul>
      `
    };

    // 6. Send Emails
    console.log("⏳ Attempting to send patient email...");
    await transporter.sendMail(patientMailOptions);
    console.log("✅ Patient email sent.");

    console.log("⏳ Attempting to send clinic notification email...");
    await transporter.sendMail(clinicMailOptions);
    console.log("✅ Clinic email sent.");

    res.status(201).json({ message: 'Booking saved and emails sent successfully!' });

  } catch (error) {
    console.error("❌ Full Error Details:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
  }
});

module.exports = router;
