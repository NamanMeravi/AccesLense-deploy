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

    // Create DOM using jsdom
    const dom = new JSDOM(html);

    // Run accessibility scan with axe-core
    const results = await new Promise((resolve, reject) => {
      axe.run(dom.window.document, (err, results) => {
        if (err) reject(err);
        else resolve(results);
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
      documentTitle: dom.window.document.title || "Untitled Page",
      pageUrl: url,
      issues,
    };
  } catch (error) {
    console.error("Accessibility check failed:", error);
    throw new Error("Accessibility check failed: " + error.message);
  }
};
