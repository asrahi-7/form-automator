// open-browser.ts
import { chromium } from "playwright";
import path from "path";

async function main() {
  const userDataDir = path.join(process.cwd(), "google_session");
  console.log("🌐 Opening Chrome using session directory:", userDataDir);

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Makes the browser visible on screen
    channel: "chrome", // Uses installed Google Chrome
    args: ["--start-maximized"],
    viewport: null,
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://accounts.google.com");

  console.log("✅ Chrome is now open! Log in or do your tasks here.");
  console.log("⚠️ Keep this terminal window open. Press Ctrl + C when you are finished.");
}

main().catch(console.error);