import { JSDOM } from "jsdom";
import axe from "axe-core";
import fetch from "node-fetch";

export const runAccessibilityCheck = async (url) => {
  try {
    // Fetch HTML from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();

    // Create DOM using jsdom with proper options
    const dom = new JSDOM(html, {
      url: url,
      pretendToBeVisual: true,
      resources: "usable",
    });

    // Inject axe-core into the jsdom window
    dom.window.axe = axe;
    
    // Ensure axe-core is properly configured for jsdom
    const { window } = dom;
    const { document } = window;

    // Run accessibility scan with axe-core
    const results = await new Promise((resolve, reject) => {
      // Use window.axe.run instead of just axe.run
      window.axe.run(document, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Extract issues in a clean format
    const issues = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => n.html),
    }));

    return {
      documentTitle: document.title || "Untitled Page",
      pageUrl: url,
      issues,
    };
  } catch (error) {
    console.error("Accessibility check failed:", error);
    throw new Error("Accessibility check failed: " + error.message);
  }
};
