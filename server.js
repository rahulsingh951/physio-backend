const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Import Routes
const bookingRoutes = require('./routes/bookingRoutes'); // <-- Added this

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Database!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Use Routes
app.use('/api/bookings', bookingRoutes); // <-- Added this

// A simple test route
app.get('/', (req, res) => {
  res.send('PhysioCare Backend is running smoothly!');
});

// Define the port 
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});