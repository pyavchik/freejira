package com.freejira.base;

import com.freejira.factory.PlaywrightFactory;
import com.freejira.pages.LoginPage;
import com.microsoft.playwright.Page;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Parameters;

import java.util.Properties;

public class BaseTest {
    
    protected PlaywrightFactory playwrightFactory;
    protected Page page;
    protected Properties prop;
    protected LoginPage loginPage;
    
    @Parameters({"browser"})
    @BeforeTest
    public void setup(String browserName) {
        playwrightFactory = new PlaywrightFactory();
        prop = new Properties();
        
        // Load config properties
        try {
            var inputStream = getClass().getClassLoader().getResourceAsStream("config/config.properties");
            if (inputStream != null) {
                prop.load(inputStream);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // Set browser from parameter or use default
        String browser = browserName != null ? browserName : prop.getProperty("browser", "chromium");
        prop.setProperty("browser", browser);
        
        // Initialize browser and page
        page = playwrightFactory.initBrowser(prop);
        loginPage = new LoginPage(page);
    }
    
    @AfterTest
    public void tearDown() {
        if (page != null) {
            page.close();
        }
        PlaywrightFactory.closeBrowser();
    }
}