const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3002;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
