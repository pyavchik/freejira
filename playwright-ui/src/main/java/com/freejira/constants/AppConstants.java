package com.freejira.constants;

import java.util.Arrays;
import java.util.List;

public class AppConstants {
    
    public static final String BASE_URL = "http://localhost:3000";
    public static final String LOGIN_PAGE_TITLE = "FreeJira - Login";
    public static final String DASHBOARD_PAGE_TITLE = "FreeJira - Dashboard";
    public static final String DEFAULT_USERNAME = "admin@example.com";
    public static final String DEFAULT_PASSWORD = "password";
    
    public static final int SHORT_TIMEOUT = 5;
    public static final int MEDIUM_TIMEOUT = 10;
    public static final int LONG_TIMEOUT = 20;
    
    public static final String CHROME_BROWSER = "chromium";
    public static final String FIREFOX_BROWSER = "firefox";
    public static final String WEBKIT_BROWSER = "webkit";
    
    public static final String REPORT_PATH = System.getProperty("user.dir") + "/test-output/";
    public static final String SCREENSHOT_PATH = REPORT_PATH + "screenshots/";
    
    public static final List<String> EXPECTED_BROWSERS = Arrays.asList(CHROME_BROWSER, FIREFOX_BROWSER, WEBKIT_BROWSER);
}