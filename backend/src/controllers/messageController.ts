import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import Profile from '../models/profileModel';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getPersonalizedMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, job_title, company, location, summary } = req.body;
    if (!name || !job_title || !company || !location || !summary) {
      res.status(400).json({
        message: "All fields (name, job_title, company, location, summary) are required."
      });
      return; 
    }

    const prompt = `Generate a short, engaging LinkedIn outreach message for a professional connection.  
    The recipient is ${name}, currently working as a ${job_title} at ${company}, located in ${location}.  
    Their profile summary: "${summary}". The message should introduce Outflo and highlight how it can help professionals like ${name}.  
    Mention how Outflo automates outreach to boost meetings and sales.  
    Keep it **concise, friendly, and action-driven**, encouraging a response. Don't generate subject line. Add dont add anything like add  your name`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    if (!response.text) {
      res.status(500).json({ message: "Failed to generate response from AI." });
      return;
    }

    res.status(200).json({ message: response.text.trim() });
  } catch (err) {
    console.error("Error generating message:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function getTextContent(page: Page, selector: string, fallback: string): Promise<string> {
  try {
    const element = await page.$(selector);
    if (element) {
      return (await element.textContent()) || fallback;
    }
    console.warn(`Selector not found: ${selector}, using fallback`);
    return fallback;
  } catch (error) {
    console.warn(`Error getting text for ${selector}:`, error);
    return fallback;
  }
}

async function extractWithMultipleSelectors(page: Page, selectors: string[], fallback: string): Promise<string> {
  for (const selector of selectors) {
    try {
      if (await page.isVisible(selector)) {
        const text = await getTextContent(page, selector, '');
        if (text) {
          console.log(`Found data with selector ${selector}: ${text}`);
          return text;
        }
      }
    } catch (error) {
      console.warn(`Selector ${selector} failed:`, error);
    }
  }
  return fallback;
}

export const scrapeAndSaveProfile = async (req: Request, res: Response): Promise<void> => {
  let browser;
  try {
    const { linkedin_url } = req.body;
    if (!linkedin_url) {
      res.status(400).json({ message: "LinkedIn URL is required" });
      return;
    }

    const existingProfile = await Profile.findOne({ linkedin_url });
    if (existingProfile) {
      res.status(409).json({ 
        message: "Profile already exists in database",
        profileId: existingProfile._id
      });
      return;
    }

    browser = await chromium.launch({
      headless: true, 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    await context.addInitScript({
      content: `
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false
        });
      `
    });
    
    const page = await context.newPage();
    
    try {
      console.log("Navigating to LinkedIn login page...");
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle', timeout: 60000 });
      if (await page.isVisible('#username')) {
        console.log("Login page detected, entering credentials...");
        await page.type('#username', process.env.LINKEDIN_EMAIL!);
        await page.type('#password', process.env.LINKEDIN_PASSWORD!);
        await page.click('button[type="submit"]');
        
        console.log("Waiting for login to complete...");
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
      } else {
        console.log("Login page not detected, might already be logged in");
      }
      
      console.log(`Navigating to profile: ${linkedin_url}`);
      await page.goto(linkedin_url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      const pageContent = await page.content();
      const contentSample = pageContent.substring(0, 1000) + '...'; 
      console.log("Page content sample:", contentSample);
      
      console.log("Looking for profile elements...");
      const possibleNameSelectors = [
        '.profile-header__name',
        '.text-heading-xlarge',
        '.pv-top-card-section__name',
        'h1.text-heading-xlarge',
        'h1.inline',
        'h1.text-xl',
        '.profile-info h1'
      ];
      
      let name = 'Unknown Name';
      for (const selector of possibleNameSelectors) {
        console.log(`Trying selector: ${selector}`);
        if (await page.isVisible(selector)) {
          name = await getTextContent(page, selector, 'Unknown Name');
          console.log(`Found name with selector ${selector}: ${name}`);
          break;
        }
      }
      
      console.log("Waiting for page to fully load...");
      await page.waitForTimeout(5000);
      
      const jobTitle = await extractWithMultipleSelectors(page, [
        '.profile-header__headline',
        '.text-body-medium',
        '.pv-top-card-section__headline'
      ], 'Unknown Title');
      
      const company = await extractWithMultipleSelectors(page, [
        '.profile-header__location-info',
        '.pv-top-card-section__location',
        '.text-body-small',
      ], 'Unknown Company');
      
      const location = await extractWithMultipleSelectors(page, [
        '.profile-header__location-info',
        '.pv-top-card-section__location',
        '.text-body-small.inline',
        '[data-field="location"]'
      ], 'Unknown Location');
      
      const summary = await extractWithMultipleSelectors(page, [
        '.pv-about__summary-text',
        '.profile-section-card__contents',
        '.about-section p',
        '.profile-summary',
        '[data-field="about"] p',
        '.display-flex.ph5.pv3 span',
        '#about + div .inline-show-more-text',
        '.inline-show-more-text',
        'section.artdeco-card p',
        '.pv-shared-text-with-see-more',
        '.display-flex.full-width span.visually-hidden',
        '#about-section .pv-shared-text-with-see-more span',
        '.about-summary',
        '.profile-section:has(h2:contains("About")) p',
        'section:has(h2:contains("About")) .pv-shared-text-with-see-more',
        '#about ~ div .pv-shared-text-with-see-more'
      ], '');

      const profileData = {
        name,
        job_title: jobTitle.trim(),
        company: company.trim(),
        location: location.trim(),
        summary: summary.trim(),
        linkedin_url
      };

      console.log('Scraped profile data:', profileData);

      // Save to MongoDB
      const newProfile = new Profile(profileData);
      const savedProfile = await newProfile.save();

      res.status(201).json({
        message: "Profile successfully saved to database",
        profileId: savedProfile._id,
        profile: savedProfile
      });
    } finally {
      await context.close();
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      message: "Failed to process LinkedIn profile",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  } finally {
    if (browser) await browser.close();
  }
};