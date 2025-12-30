package com.freejira.base;

import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;

public class SimpleBaseTest {
    
    @BeforeTest
    public void setup() {
        // No browser initialization for simple tests
        System.out.println("Setting up simple test...");
    }
    
    @AfterTest
    public void tearDown() {
        // No browser cleanup needed for simple tests
        System.out.println("Tearing down simple test...");
    }
}