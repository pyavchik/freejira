package com.freejira.pages;

import com.microsoft.playwright.Page;
import com.freejira.constants.AppConstants;

public class DashboardPage {
    
    private final Page page;
    
    // Locators
    private final String pageHeader = "h1:text('Dashboard')";
    private final String createProjectButton = "button:has-text('Create Project')";
    private final String workspaceDropdown = "select[name='workspace']";
    private final String userMenu = "button[aria-label='User menu']";
    private final String logoutButton = "button:has-text('Logout')";
    private final String projectsTab = "a[href*='projects']";
    private final String tasksTab = "a[href*='tasks']";
    private final String workspacesTab = "a[href*='workspaces']";
    
    public DashboardPage(Page page) {
        this.page = page;
    }
    
    public String getDashboardPageTitle() {
        return page.title();
    }
    
    public String getDashboardPageURL() {
        return page.url();
    }
    
    public boolean isDashboardHeaderDisplayed() {
        return page.isVisible(pageHeader);
    }
    
    public boolean isCreateProjectButtonDisplayed() {
        return page.isVisible(createProjectButton);
    }
    
    public void navigateToProjects() {
        page.click(projectsTab);
    }
    
    public void navigateToTasks() {
        page.click(tasksTab);
    }
    
    public void navigateToWorkspaces() {
        page.click(workspacesTab);
    }
    
    public void logout() {
        page.click(userMenu);
        page.click(logoutButton);
    }
    
    public String getCurrentUserName() {
        return page.textContent("//button[@aria-label='User menu']//span[1]");
    }
}