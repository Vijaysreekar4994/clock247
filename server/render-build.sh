#!/usr/bin/env bash

# Install server dependencies
cd server
npm install

# Install client dependencies and build React
cd ../client
npm install
npm run build

# Go back to server and force Puppeteer to download Chromium
cd ../server
npx puppeteer install
