const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.xe.com/currencycharts/?from=EUR&to=INR&view=1D');

  // Example: Grab rate from page content (you need to inspect the actual element)
  const rate = await page.evaluate(() => {
    const element = document.querySelector('.rate'); // Use correct selector
    return element ? element.innerText : null;
  });

  console.log('Exchange Rate:', rate);
  await browser.close();
})();
