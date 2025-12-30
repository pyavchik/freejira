package com.freejira.pages;

import com.microsoft.playwright.Page;
import com.freejira.constants.AppConstants;

public class LoginPage {
    
    private final Page page;
    
    // Locators
    private final String emailInput = "input[name='email']";
    private final String passwordInput = "input[name='password']";
    private final String loginButton = "button[type='submit']";
    private final String registerLink = "a[href*='register']";
    private final String forgotPasswordLink = "a[href*='forgot-password']";
    private final String errorMessage = ".text-red-500";
    
    public LoginPage(Page page) {
        this.page = page;
    }
    
    public String getLoginPageTitle() {
        return page.title();
    }
    
    public String getLoginPageURL() {
        return page.url();
    }
    
    public boolean isForgotPasswordLinkExist() {
        return page.isVisible(forgotPasswordLink);
    }
    
    public boolean isRegisterLinkExist() {
        return page.isVisible(registerLink);
    }
    
    public DashboardPage doLogin(String username, String password) {
        System.out.println("Login with: " + username + " and " + password);
        
        page.fill(emailInput, username);
        page.fill(passwordInput, password);
        page.click(loginButton);
        
        return new DashboardPage(page);
    }
    
    public DashboardPage doLogin() {
        return doLogin(AppConstants.DEFAULT_USERNAME, AppConstants.DEFAULT_PASSWORD);
    }
    
    public boolean isErrorMessageDisplayed() {
        return page.isVisible(errorMessage);
    }
    
    public String getErrorMessage() {
        return page.textContent(errorMessage);
    }
    
    public void navigateToForgotPassword() {
        page.click(forgotPasswordLink);
    }
    
    public void navigateToRegister() {
        page.click(registerLink);
    }
}