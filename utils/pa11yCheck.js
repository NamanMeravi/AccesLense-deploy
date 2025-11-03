import pa11y from "pa11y";
import fs from "fs";

export const runAccessibilityCheck = async (url) => {
  try {
    // Get browser configuration
    const browserConfig = await getBrowserConfig();
    
    // Configure Pa11y with Puppeteer browser options
    // Pa11y 9.x uses 'browser' option with Puppeteer launch options
    const pa11yOptions = {
      timeout: 60000, // 60 seconds timeout
      wait: 1000, // Wait 1 second for page load
      ignore: [], // Don't ignore any issues
    };

    // Configure browser with proper settings for server environments
    pa11yOptions.browser = {
      args: browserConfig.args,
    };

    // Set executable path if found
    if (browserConfig.executablePath) {
      pa11yOptions.browser.executablePath = browserConfig.executablePath;
    } else {
      // Try to use Puppeteer's bundled Chrome if available
      try {
        const puppeteer = await import('puppeteer');
        const executablePath = await puppeteer.executablePath();
        if (executablePath && fs.existsSync(executablePath)) {
          pa11yOptions.browser.executablePath = executablePath;
        }
      } catch (puppeteerError) {
        console.warn('Could not get Puppeteer executable path, using default');
      }
    }

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
const getBrowserConfig = async () => {
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

  return {
    args: browserArgs,
    executablePath: executablePath,
  };
};