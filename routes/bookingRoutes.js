const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const sgMail = require('@sendgrid/mail');

// 1. Initialize SendGrid using your Railway Environment Variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/new', async (req, res) => {
  try {
    console.log("📥 Received new booking:", req.body);

    // 2. Save the booking to MongoDB
    const newBooking = new Booking(req.body);
    await newBooking.save();
    console.log("✅ Booking saved to database.");

    // 3. Draft Email to the Patient
    const patientMsg = {
      to: req.body.email, 
      from: 'appointments@happyyhealinghub.in', // <-- MUST match your verified SendGrid email
      subject: 'Booking Confirmation - Happy Healing Hub',
      html: `
        <h3>Hello ${req.body.name},</h3>
        <p>Thank you for choosing Happy Healing Hub.</p>
        <p>Your appointment request has been successfully received. We will contact you shortly to confirm the exact time.</p>
        <br>
        <p>Warm Regards,<br>The Happy Healing Hub Team</p>
      `
    };

    // 4. Draft Email Notification to the Clinic (You)
    const clinicMsg = {
      to: 'your_actual_email@gmail.com', // <-- Put the email where you want to receive notifications
      from: 'appointments@happyyhealinghub.in', // <-- MUST match your verified SendGrid email
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

    // 5. Send both emails simultaneously
    await Promise.all([
      sgMail.send(patientMsg),
      sgMail.send(clinicMsg)
    ]);
    
    console.log("✅ Both emails sent successfully via SendGrid.");

    // 6. Tell the frontend it was a success
    res.status(201).json({ message: 'Booking saved and emails sent successfully!' });

  } catch (error) {
    console.error("❌ SendGrid or Database Error Details:");
    
    // SendGrid hides its errors a bit deep, this block exposes exactly what went wrong
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
    
    res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
  }
});

module.exports = router;
