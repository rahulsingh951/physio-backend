const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid using the environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/new', async (req, res) => {
  try {
    console.log("📥 Received new booking:", req.body);

    // 1. Save the booking details to MongoDB
    const newBooking = new Booking(req.body);
    await newBooking.save();
    console.log("✅ Booking saved to database.");

    // 2. Draft Confirmation Email to the Patient
    const patientMsg = {
      to: req.body.email, 
      from: process.env.FROM_EMAIL, // 🔒 Loaded from environment variable
      subject: 'Booking Confirmation - Happy Healing Hub',
      html: `
        <h3>Hello ${req.body.name},</h3>
        <p>Thank you for choosing Happy Healing Hub.</p>
        <p>Your appointment request has been successfully received. We will contact you shortly to confirm the exact time.</p>
        <br>
        <p>Warm Regards,<br>The Happy Healing Hub Team</p>
      `
    };

    
    const clinicMsg = {
   to: process.env.CLINIC_EMAIL || 'admin@happyyhealinghub.in', 
  from: process.env.FROM_EMAIL,
  subject: `🚨 New Patient Booking: ${req.body.name}`,
  html: `
    <h3>New Booking Received!</h3>
    <ul>
      <li><strong>Name:</strong> ${req.body.name}</li>
      <li><strong>Email:</strong> ${req.body.email}</li>
      <li><strong>Phone:</strong> ${req.body.phone}</li>
    </ul>
  `
};

    // 4. Send both emails simultaneously
    await Promise.all([
      sgMail.send(patientMsg),
      sgMail.send(clinicMsg)
    ]);
    
    console.log("✅ Both emails sent successfully via SendGrid.");

    // 5. Send success response back to Axios frontend
    res.status(201).json({ message: 'Booking saved and emails sent successfully!' });

  } catch (error) {
    console.error("❌ SendGrid or Database Error Details:");
    
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
    
    res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
  }
});

module.exports = router;