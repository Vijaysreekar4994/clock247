import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000',  // React dev server
  methods: ['GET', 'POST'],
  credentials: true
}));

app.get('/api/exchange-rate', async (req, res) => {
  try {
    const response = await fetch(`${process.env.EXCHANGE_API_URL}/${process.env.EXCHANGE_API_KEY}/latest/EUR`);
    const data = await response.json();
    const rate = data.conversion_rates.INR;  // EUR to INR

    if (rate) {
      res.json({ rate });  // Send the rate rounded to 2 decimal places
    } else {
      res.status(404).json({ error: 'Rate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

