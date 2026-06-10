const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware - Updated CORS to allow your live domains
app.use(cors({
    origin: [
        'http://localhost:5173',           // For local testing (React/Vite default)
        'https://www.happyyhealinghub.in', // Your live WWW domain
        'https://happyyhealinghub.in'      // Your live root domain
    ],
    credentials: true
}));

app.use(express.json()); 

// Import Routes
const bookingRoutes = require('./routes/bookingRoutes'); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Database!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Use Routes
app.use('/api/bookings', bookingRoutes); 

// A simple test route
app.get('/', (req, res) => {
  res.send('PhysioCare Backend is running smoothly!');
});

// Define the port 
// Define the port 
const PORT = process.env.PORT || 5000;

// Start the server (Explicitly binding to 0.0.0.0 for Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running publicly on port ${PORT}`);
});