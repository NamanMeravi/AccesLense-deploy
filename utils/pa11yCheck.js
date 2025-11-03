import pa11y from "pa11y";
import puppeteer from "puppeteer";
import fs from "fs";

export const runAccessibilityCheck = async (url) => {
  try {
    // Get browser launch configuration
    const launchOptions = getBrowserConfig();
    
    // Configure Pa11y with Puppeteer
    // Pa11y 9.x requires: browser = Puppeteer module, launch = launch options
    const pa11yOptions = {
      timeout: 60000, // 60 seconds timeout
      wait: 1000, // Wait 1 second for page load
      ignore: [], // Don't ignore any issues
      browser: puppeteer, // Pass Puppeteer module
      launch: launchOptions, // Pass launch options separately
    };

    const results = await pa11y(url, pa11yOptions);

    // Extract only messages from issues
    const issues = results.issues.map(issue => issue.message);

    return {
      documentTitle: results.documentTitle,
      pageUrl: results.pageUrl,
      issues
    };
  } catch (error) {
    throw new Error("Accessibility check failed: " + error.message);
  }
};

// Helper function to get browser configuration
const getBrowserConfig = () => {
  // Browser arguments for server environments (Render, Docker, etc.)
  const browserArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
  ];

  const launchOptions = {
    args: browserArgs,
    headless: true,
  };

  // Check for Chrome in common locations (useful for production environments)
  const possiblePaths = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : null,
    process.platform === 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' : null,
  ].filter(Boolean);

  // Try to find Chrome executable
  let executablePath = null;
  for (const chromePath of possiblePaths) {
    try {
      if (fs.existsSync(chromePath)) {
        executablePath = chromePath;
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }

  // If no system Chrome found, let Puppeteer use its bundled Chrome
  // Puppeteer will automatically find its bundled Chrome if executablePath is not specified

  // Set executable path if found
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  return launchOptions;
};