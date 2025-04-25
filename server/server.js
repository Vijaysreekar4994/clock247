import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS only in development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }));
}

// API Endpoint
app.get('/api/exchange-rate', async (req, res) => {
  try {
    const response = await fetch(`${process.env.EXCHANGE_API_URL}/${process.env.EXCHANGE_API_KEY}/latest/EUR`);
    const data = await response.json();
    const rate = data.conversion_rates.INR;
    if (rate) {
      res.json({ rate: parseFloat(rate.toFixed(1)) });
    } else {
      res.status(404).json({ error: 'Rate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const indexPath = path.join(clientBuildPath, 'index.html');

  // Check if index.html exists before adding the wildcard
  if (fs.existsSync(indexPath)) {
    app.get('*', (req, res, next) => {
      try {
        res.sendFile(indexPath);
      } catch (error) {
        console.error('Failed to send index.html:', error);
        next(error);
      }
    });
  } else {
    console.warn('⚠️ index.html does not exist at expected path:', indexPath);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
