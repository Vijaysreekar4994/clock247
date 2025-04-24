const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',  // React dev server
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, '../client/build')));

// API endpoint to fetch exchange rate from xe.com/send-money
app.get('/api/exchange-rate', async (req, res) => {
  try {
    // console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched');
    
    const page = await browser.newPage();
    // console.log('Page opened');
    
    async function safeGoto(page, url) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      } catch (error) {
        console.error('First attempt failed, retrying...');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      }
    }
    await safeGoto(page, 'https://www.xe.com/send-money/');
    console.log('Page loaded');

    // Helper: Type and Confirm Dropdown Option
    async function typeAndSelect(selector, text) {
      await page.click(selector);
      await page.waitForSelector(`${selector} input[role="combobox"]`);
      const input = await page.$(`${selector} input[role="combobox"]`);
      await input.click({ clickCount: 3 });
      await input.type(text, { delay: 100 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.keyboard.press('Enter');
    }

    // Select Destination Country as India
    await typeAndSelect('#countryCombobox', 'India');

    // Select Sending Currency as EUR Euro
    await typeAndSelect('#sending-currency', 'EUR');

    // Wait for content to settle
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract the Rate
    const rate = await page.$eval('[data-testid="unitRate"] span:last-child', el => el.textContent.trim());

    await browser.close();

    if (rate) {
      res.json({ rate });
    } else {
      res.status(404).json({ error: 'Rate not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

// Serve React app
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});


// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = 4000;

// app.use(cors());

// // Test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'API working' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });