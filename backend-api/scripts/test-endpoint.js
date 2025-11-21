// Simple test endpoint to verify the API structure
const express = require('express');
const app = express();

// Test the exact same route structure as the main server
app.use('/api/v1/auth/login', (req, res) => {
  console.log('Received request to /api/v1/auth/login');
  res.json({ message: 'This is the correct endpoint' });
});

app.listen(5001, () => {
 console.log('Test server running on port 5001');
});