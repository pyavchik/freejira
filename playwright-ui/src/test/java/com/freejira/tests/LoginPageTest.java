package com.freejira.tests;

import com.freejira.base.BaseTest;
import com.freejira.constants.AppConstants;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginPageTest extends BaseTest {
    
    @Test(priority = 1)
    public void loginPageTitleTest() {
        String actualTitle = loginPage.getLoginPageTitle();
        System.out.println("Login page title: " + actualTitle);
        Assert.assertEquals(actualTitle, AppConstants.LOGIN_PAGE_TITLE);
    }
    
    @Test(priority = 2)
    public void loginPageURLTest() {
        String actualURL = loginPage.getLoginPageURL();
        System.out.println("Login page URL: " + actualURL);
        Assert.assertTrue(actualURL.contains("login"));
    }
    
    @Test(priority = 3)
    public void forgotPasswordLinkTest() {
        Assert.assertTrue(loginPage.isForgotPasswordLinkExist());
    }
    
    @Test(priority = 4)
    public void registerLinkTest() {
        Assert.assertTrue(loginPage.isRegisterLinkExist());
    }
    
    @Test(priority = 5, enabled = false)
    public void loginTest() {
        // This test requires the FreeJira application to be running
        // Enable this test when the application is available
        loginPage.doLogin();
        String actualTitle = loginPage.getLoginPageTitle();
        System.out.println("After login page title: " + actualTitle);
        Assert.assertEquals(actualTitle, AppConstants.DASHBOARD_PAGE_TITLE);
    }
}