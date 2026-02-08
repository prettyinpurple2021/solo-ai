
import { chromium } from '@playwright/test';
import path from 'path';
import os from 'os';
import fs from 'fs';
import readline from 'readline';

const USER_DATA_DIR = path.join(os.homedir(), '.solosuccess-agent-browser');

export async function postToX(text: string): Promise<boolean> {
  console.log("Launching browser to post to X...");
  
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const browserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chrome', // Use installed chrome if available, or bundled chromium
    viewport: { width: 1280, height: 720 },
    args: ['--disable-blink-features=AutomationControlled'] // Try to hide automation
  });

  const page = await browserContext.newPage();
  
  try {
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });
    
    // Check if logged in by looking for the "Post" button or composer
    // X changes classes often, looking for aria-labels or text is better
    
    let isLoggedIn = false;
    try {
      // Wait a bit for potential redirects
      await page.waitForTimeout(3000);
      
      // Check for "What is happening?!" placeholder or "Post" button
      const composer = await page.$('[aria-label="Post text"]');
      const postButton = await page.$('[data-testid="SideNav_NewTweet_Button"]');
      
      if (composer || postButton) {
        isLoggedIn = true;
      }
    } catch (e) {
      // Ignore
    }

    if (!isLoggedIn) {
      console.log("\n⚠️  Not logged in to X (Twitter).");
      console.log("Please log in manually in the browser window.");
      console.log("Navigate to https://x.com/login if needed.");
      console.log("Once you are on the home timeline, press ENTER here to continue.");
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise<void>(resolve => {
        rl.question('Press ENTER when logged in...', () => {
          rl.close();
          resolve();
        });
      });
      
      // Verify again
      await page.waitForTimeout(2000);
      const composer = await page.$('[aria-label="Post text"]');
      if (!composer && !(await page.$('[data-testid="SideNav_NewTweet_Button"]'))) {
        console.error("Still not logged in. Aborting.");
        await browserContext.close();
        return false;
      }
    }

    // Go to compose if not already focused
    // Clicking the "Post" button on side nav is reliable
    const sidePostBtn = await page.$('[data-testid="SideNav_NewTweet_Button"]');
    if (sidePostBtn) {
      await sidePostBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Type content
    // X uses a contenteditable div
    // [data-testid="tweetTextarea_0"] or similar
    const textAreaSelector = '[data-testid="tweetTextarea_0"]'; // This is standard for X
    await page.waitForSelector(textAreaSelector);
    
    await page.click(textAreaSelector);
    await page.keyboard.type(text);
    
    // Wait for "Post" button to be enabled
    const postBtnSelector = '[data-testid="tweetButton"]';
    await page.waitForSelector(postBtnSelector);
    
    console.log("\nReady to post!");
    console.log(`Content: "${text}"`);
    
    // Final Confirmation
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const confirmed = await new Promise<boolean>(resolve => {
        rl.question('Click "Post" now? (y/n): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase().startsWith('y'));
        });
    });

    if (confirmed) {
        await page.click(postBtnSelector);
        console.log("Posted!");
        await page.waitForTimeout(3000); // Wait for post to send
    } else {
        console.log("Cancelled.");
    }

    return true;

  } catch (error) {
    console.error("Error asking browser to post:", error);
    return false;
  } finally {
    await browserContext.close();
  }
}
