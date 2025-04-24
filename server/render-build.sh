#!/usr/bin/env bash

# Install backend dependencies
cd server
npm install

# Install frontend dependencies and build React app
cd ../client
npm install
npm run build

# Back to server and force Puppeteer to download Chromium
cd ../server
npx puppeteer install
