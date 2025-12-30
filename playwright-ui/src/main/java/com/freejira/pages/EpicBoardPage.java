package com.freejira.pages;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;
import java.util.List;

/**
 * Page Object for Epic Board functionality
 * Handles epic creation, movement, and status changes
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
    }
    
    /**
     * Create a new epic in TODO status
     */
    public void createEpic(String title, String description) {
        System.out.println("➕ Creating epic: " + title);
        
        try {
            // Click create epic button
            page.click(createEpicButton);
            
            // Fill in epic details
            page.fill(epicTitleInput, title);
            page.fill(epicDescriptionInput, description);
            
            // Submit the form
            page.click(epicCreateButton);
            
            System.out.println("✅ Epic created successfully");
            
        } catch (Exception e) {
            System.out.println("❌ Error creating epic: " + e.getMessage());
        }
    }
    
    /**
     * Move an epic from TODO to IN PROGRESS using drag and drop
     */
    public void moveEpicFromTodoToInProgress(String epicTitle) {
        System.out.println("🔄 Moving epic '" + epicTitle + "' from TODO to IN PROGRESS");
        
        try {
            // Find the epic card in TODO column
            Locator epicInTodo = page.locator(todoColumn).locator(epicCard).filter(
                new Locator.FilterOptions().setHasText(epicTitle)
            );
            
            // Find the IN PROGRESS column drop zone
            Locator inProgressDropZone = page.locator(inProgressColumn);
            
            // Perform drag and drop
            epicInTodo.dragTo(inProgressDropZone);
            
            System.out.println("✅ Epic moved successfully using drag and drop");
            
        } catch (Exception e) {
            System.out.println("❌ Error moving epic: " + e.getMessage());
        }
    }
    
    /**
     * Verify epic status changed to IN PROGRESS
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
     */
    public List<String> getEpicsInTodo() {
        System.out.println("📋 Getting epics in TODO column");
        
        try {
            return page.locator(todoColumn).locator(epicCard).allTextContents();
            
        } catch (Exception e) {
            System.out.println("❌ Error getting TODO epics: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get all epics in IN PROGRESS column
     */
    public List<String> getEpicsInInProgress() {
        System.out.println("📋 Getting epics in IN PROGRESS column");
        
        try {
            return page.locator(inProgressColumn).locator(epicCard).allTextContents();
            
        } catch (Exception e) {
            System.out.println("❌ Error getting IN PROGRESS epics: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Verify epic board is loaded
     */
    public boolean isEpicBoardLoaded() {
        System.out.println("🔍 Checking if epic board is loaded");
        
        try {
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
}