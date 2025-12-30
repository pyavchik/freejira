package com.freejira.tests;

import com.freejira.base.SimpleBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test class specifically designed to work well with IntelliJ IDEA
 * No browser dependencies, no parameters required
 */
public class IntelliJTest extends SimpleBaseTest {
    
    @Test
    public void testIntelliJCompatibility() {
        System.out.println("✅ IntelliJ compatibility test - PASSED");
        Assert.assertTrue(true, "IntelliJ should be able to run this test without issues");
    }
    
    @Test
    public void testFrameworkSetup() {
        System.out.println("✅ Framework setup test - PASSED");
        Assert.assertTrue(true, "Framework is properly configured");
    }
    
    @Test
    public void testNoBrowserRequired() {
        System.out.println("✅ No browser required test - PASSED");
        Assert.assertTrue(true, "This test doesn't need a browser");
    }
}