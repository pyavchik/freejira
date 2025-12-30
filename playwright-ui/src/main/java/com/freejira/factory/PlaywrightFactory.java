package com.freejira.factory;

import com.microsoft.playwright.*;
import com.freejira.constants.AppConstants;

import java.util.Base64;
import java.util.Properties;

public class PlaywrightFactory {
    
    private static ThreadLocal<Playwright> tlPlaywright = new ThreadLocal<>();
    private static ThreadLocal<Browser> tlBrowser = new ThreadLocal<>();
    private static ThreadLocal<BrowserContext> tlBrowserContext = new ThreadLocal<>();
    private static ThreadLocal<Page> tlPage = new ThreadLocal<>();
    
    private Properties prop;
    private static String highlight;
    
    public static Playwright getPlaywright() {
        return tlPlaywright.get();
    }
    
    public static Browser getBrowser() {
        return tlBrowser.get();
    }
    
    public static BrowserContext getBrowserContext() {
        return tlBrowserContext.get();
    }
    
    public static Page getPage() {
        return tlPage.get();
    }
    
    public Page initBrowser(Properties prop) {
        this.prop = prop;
        highlight = prop.getProperty("highlight").trim();
        
        String browserName = prop.getProperty("browser").trim().toLowerCase();
        
        System.out.println("Browser name is: " + browserName);
        
        // Initialize Playwright
        tlPlaywright.set(Playwright.create());
        
        switch (browserName) {
            case "chromium":
                tlBrowser.set(getPlaywright().chromium().launch(getBrowserOptions()));
                break;
            case "firefox":
                tlBrowser.set(getPlaywright().firefox().launch(getBrowserOptions()));
                break;
            case "webkit":
                tlBrowser.set(getPlaywright().webkit().launch(getBrowserOptions()));
                break;
            case "chrome":
                tlBrowser.set(getPlaywright().chromium().launch(getChromeOptions()));
                break;
            default:
                System.out.println("Please pass the right browser name...");
                throw new RuntimeException("INVALID BROWSER NAME");
        }
        
        tlBrowserContext.set(getBrowser().newContext(getBrowserContextOptions()));
        tlPage.set(getBrowserContext().newPage());
        
        getPage().navigate(prop.getProperty("url").trim());
        
        return getPage();
    }
    
    private BrowserType.LaunchOptions getBrowserOptions() {
        BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions();
        launchOptions.setHeadless(Boolean.parseBoolean(prop.getProperty("headless")));
        return launchOptions;
    }
    
    private BrowserType.LaunchOptions getChromeOptions() {
        BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions();
        launchOptions.setHeadless(Boolean.parseBoolean(prop.getProperty("headless")));
        launchOptions.setChannel("chrome");
        return launchOptions;
    }
    
    private Browser.NewContextOptions getBrowserContextOptions() {
        Browser.NewContextOptions contextOptions = new Browser.NewContextOptions();
        contextOptions.setViewportSize(1920, 1080);
        
        if (Boolean.parseBoolean(highlight)) {
            contextOptions.setJavaScriptEnabled(true);
        }
        
        return contextOptions;
    }
    
    /**
     * This method will take screenshot
     * @param page
     * @param testMethodName
     */
    public static String takeScreenshot(Page page, String testMethodName) {
        String path = AppConstants.SCREENSHOT_PATH + testMethodName + ".png";
        page.screenshot(new Page.ScreenshotOptions().setPath(java.nio.file.Paths.get(path)));
        return path;
    }
    
    /**
     * This method will close the browser
     */
    public static void closeBrowser() {
        if (tlBrowser.get() != null) {
            tlBrowser.get().close();
        }
        if (tlPlaywright.get() != null) {
            tlPlaywright.get().close();
        }
    }
}