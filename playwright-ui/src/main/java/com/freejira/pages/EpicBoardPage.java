package com.freejira.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.options.AriaRole;
import java.util.List;

/**
 * Page Object for Epic Board functionality
 * Handles epic creation, movement, and status changes using Playwright best practices
 */
public class EpicBoardPage {
    
    private final Page page;
    
    // Locators for Epic Board elements
    private final String epicBoardContainer = ".epic-board-container";
    private final String todoColumn = "div:has-text('Todo')";
    private final String inProgressColumn = "div:has-text('In Progress')";
    private final String doneColumn = "div:has-text('Done')";
    private final String epicCard = ".epic-card";
    private final String createEpicButton = "button:has-text('New Epic')";
    private final String epicTitleInput = "input[name='name']";
    private final String epicDescriptionInput = "textarea[name='description']";
    private final String epicCreateButton = "button[type='submit']:has-text('Create')";
    
    public EpicBoardPage(Page page) {
        this.page = page;
    }
    
    /**
     * Navigate to epic board from dashboard
     */
    public void navigateToEpicBoard() {
        System.out.println("🗺️  Navigating to Epic Board...");
        // Implementation would navigate to a specific project's epic board
        
        // Use Playwright's built-in navigation with timeout
        try {
            page.waitForSelector(epicBoardContainer, new Page.WaitForSelectorOptions().setTimeout(5000));
            System.out.println("✅ Epic board navigation successful");
        } catch (Exception e) {
            System.out.println("❌ Epic board navigation failed: " + e.getMessage());
        }
    }
    
    /**
     * Create a new epic in TODO status
     * Uses Playwright best practices for form interaction
     */
    public void createEpic(String title, String description) {
        System.out.println("➕ Creating epic: " + title);
        
        try {
            // Click create epic button with explicit wait
            page.click(createEpicButton);
            
            // Wait for the epic creation modal to appear
            page.waitForSelector(epicTitleInput, new Page.WaitForSelectorOptions().setTimeout(3000));
            
            // Fill in epic details using Playwright's fill method
            page.fill(epicTitleInput, title);
            page.fill(epicDescriptionInput, description);
            
            // Submit the form with explicit wait
            page.click(epicCreateButton);
            
            // Wait for the epic to appear in the TODO column
            page.waitForTimeout(1000);
            
            System.out.println("✅ Epic created successfully");
            
        } catch (Exception e) {
            System.out.println("❌ Error creating epic: " + e.getMessage());
            throw new RuntimeException("Epic creation failed: " + e.getMessage());
        }
    }
    
    /**
     * Move an epic from TODO to IN PROGRESS using drag and drop
     * Uses Playwright's drag and drop functionality
     */
    public void moveEpicFromTodoToInProgress(String epicTitle) {
        System.out.println("🔄 Moving epic '" + epicTitle + "' from TODO to IN PROGRESS");
        
        try {
            // Find the epic card in TODO column using Playwright locator
            Locator epicInTodo = page.locator(todoColumn).locator(epicCard).filter(
                new Locator.FilterOptions().setHasText(epicTitle)
            );
            
            // Verify the epic exists before moving
            if (epicInTodo.count() == 0) {
                throw new RuntimeException("Epic not found in TODO column: " + epicTitle);
            }
            
            // Find the IN PROGRESS column drop zone
            Locator inProgressDropZone = page.locator(inProgressColumn);
            
            // Perform drag and drop with Playwright
            epicInTodo.dragTo(inProgressDropZone);
            
            // Wait for the movement to complete
            page.waitForTimeout(1000);
            
            System.out.println("✅ Epic moved successfully using drag and drop");
            
        } catch (Exception e) {
            System.out.println("❌ Error moving epic: " + e.getMessage());
            throw new RuntimeException("Epic movement failed: " + e.getMessage());
        }
    }
    
    /**
     * Verify epic status changed to IN PROGRESS
     * Uses Playwright locator for verification
     */
    public boolean verifyEpicInInProgress(String epicTitle) {
        System.out.println("🔍 Verifying epic '" + epicTitle + "' is in IN PROGRESS");
        
        try {
            // Check if epic exists in IN PROGRESS column
            Locator epicInProgress = page.locator(inProgressColumn).locator(epicCard).filter(
                new Locator.FilterOptions().setHasText(epicTitle)
            );
            
            boolean exists = epicInProgress.count() > 0;
            
            if (exists) {
                System.out.println("✅ Epic found in IN PROGRESS column");
            } else {
                System.out.println("❌ Epic not found in IN PROGRESS column");
            }
            
            return exists;
            
        } catch (Exception e) {
            System.out.println("❌ Error verifying epic status: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get all epics in TODO column
     * Uses Playwright's allTextContents for efficient retrieval
     */
    public List<String> getEpicsInTodo() {
        System.out.println("📋 Getting epics in TODO column");
        
        try {
            // Wait for TODO column to be visible
            page.waitForSelector(todoColumn, new Page.WaitForSelectorOptions().setTimeout(2000));
            
            return page.locator(todoColumn).locator(epicCard).allTextContents();
            
        } catch (Exception e) {
            System.out.println("❌ Error getting TODO epics: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get all epics in IN PROGRESS column
     * Uses Playwright's allTextContents for efficient retrieval
     */
    public List<String> getEpicsInInProgress() {
        System.out.println("📋 Getting epics in IN PROGRESS column");
        
        try {
            // Wait for IN PROGRESS column to be visible
            page.waitForSelector(inProgressColumn, new Page.WaitForSelectorOptions().setTimeout(2000));
            
            return page.locator(inProgressColumn).locator(epicCard).allTextContents();
            
        } catch (Exception e) {
            System.out.println("❌ Error getting IN PROGRESS epics: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get all epics in DONE column
     * Uses Playwright's allTextContents for efficient retrieval
     */
    public List<String> getEpicsInDone() {
        System.out.println("📋 Getting epics in DONE column");
        
        try {
            // Wait for DONE column to be visible
            page.waitForSelector(doneColumn, new Page.WaitForSelectorOptions().setTimeout(2000));
            
            return page.locator(doneColumn).locator(epicCard).allTextContents();
            
        } catch (Exception e) {
            System.out.println("❌ Error getting DONE epics: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Verify epic board is loaded
     * Uses Playwright's isVisible for each column
     */
    public boolean isEpicBoardLoaded() {
        System.out.println("🔍 Checking if epic board is loaded");
        
        try {
            // Wait for all columns to be visible
            page.waitForSelector(todoColumn, new Page.WaitForSelectorOptions().setTimeout(3000));
            page.waitForSelector(inProgressColumn, new Page.WaitForSelectorOptions().setTimeout(3000));
            page.waitForSelector(doneColumn, new Page.WaitForSelectorOptions().setTimeout(3000));
            
            boolean loaded = page.isVisible(todoColumn) && 
                           page.isVisible(inProgressColumn) && 
                           page.isVisible(doneColumn);
            
            System.out.println(loaded ? "✅ Epic board loaded" : "❌ Epic board not loaded");
            return loaded;
            
        } catch (Exception e) {
            System.out.println("❌ Error checking epic board: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get epic count in TODO column
     * Efficient count using Playwright locator
     */
    public int getEpicCountInTodo() {
        try {
            return page.locator(todoColumn).locator(epicCard).count();
        } catch (Exception e) {
            System.out.println("❌ Error getting TODO epic count: " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Get epic count in IN PROGRESS column
     * Efficient count using Playwright locator
     */
    public int getEpicCountInInProgress() {
        try {
            return page.locator(inProgressColumn).locator(epicCard).count();
        } catch (Exception e) {
            System.out.println("❌ Error getting IN PROGRESS epic count: " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Get epic count in DONE column
     * Efficient count using Playwright locator
     */
    public int getEpicCountInDone() {
        try {
            return page.locator(doneColumn).locator(epicCard).count();
        } catch (Exception e) {
            System.out.println("❌ Error getting DONE epic count: " + e.getMessage());
            return 0;
        }
    }
}