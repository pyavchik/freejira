package com.freejira.tests;

import com.freejira.base.SimpleBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SimpleTest extends SimpleBaseTest {
    
    @Test
    public void testFrameworkSetup() {
        System.out.println("Testing framework setup...");
        Assert.assertTrue(true, "Framework setup test should pass");
    }
    
    @Test
    public void testStringOperations() {
        String testString = "FreeJira";
        System.out.println("Testing string operations with: " + testString);
        Assert.assertEquals(testString.length(), 8, "String length should be 8");
        Assert.assertTrue(testString.contains("Jira"), "String should contain 'Jira'");
    }
    
    @Test
    public void testMathOperations() {
        int a = 5;
        int b = 7;
        int result = a + b;
        System.out.println("Testing math operations: " + a + " + " + b + " = " + result);
        Assert.assertEquals(result, 12, "5 + 7 should equal 12");
    }
}