import pa11y from "pa11y";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runAccessibilityCheck = async (url) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const results = await pa11y(url, { browser });
    await browser.close();

    const issues = results.issues.map(issue => issue.message);
    return {
      documentTitle: results.documentTitle,
      pageUrl: results.pageUrl,
      issues,
    };
  } catch (error) {
    throw new Error("Accessibility check failed: " + error.message);
  }
};
