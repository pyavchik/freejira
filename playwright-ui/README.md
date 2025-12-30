# FreeJira Playwright UI Test Framework

A comprehensive UI test automation framework for FreeJira project management system using Playwright Java.

## Framework Structure

```
playwright-ui/
├── pom.xml                          # Maven build configuration
├── testng.xml                       # TestNG test suite configuration
├── README.md                        # This file
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/freejira/
│   │   │       ├── constants/       # Constants and configuration
│   │   │       ├── factory/          # Browser factory and utilities
│   │   │       └── pages/            # Page Object Model classes
│   │   └── resources/
│   │       └── config/              # Configuration files
│   └── test/
│       ├── java/
│       │   └── com/freejira/
│       │       ├── base/            # Base test classes
│       │       └── tests/           # Test classes
│       └── resources/
│           └── config/              # Test configuration files
└── test-output/                     # Test reports and screenshots (generated)
```

## Features

- **Playwright Java**: Cross-browser testing with Chromium, Firefox, and WebKit
- **Page Object Model**: Clean separation of test logic and page interactions
- **TestNG**: Powerful test execution and reporting
- **Maven**: Dependency management and build automation
- **Thread-safe**: Parallel test execution support
- **Extensible**: Easy to add new page objects and test cases

## Prerequisites

- Java 11 or higher
- Maven 3.6+
- Node.js (for Playwright browser binaries)

## Setup

1. **Install dependencies**:
   ```bash
   mvn clean install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
mvn test
```

### Run specific test suite
```bash
mvn test -Dtest=LoginPageTest
```

### Run with different browser
```bash
mvn test -Dbrowser=firefox
```

### Run in headless mode
Update the `config.properties` file:
```properties
headless=true
```

## Configuration

Edit `src/test/resources/config/config.properties` to configure:
- Base URL
- Browser settings
- Timeout values
- User credentials
- Reporting options

## Adding New Tests

1. **Create a new page object**:
   - Add a new class in `src/main/java/com/freejira/pages/`
   - Follow the existing pattern (locators, methods, navigation)

2. **Create a new test class**:
   - Add a new class in `src/test/java/com/freejira/tests/`
   - Extend `BaseTest`
   - Add test methods with `@Test` annotation

3. **Add to test suite**:
   - Update `testng.xml` to include your new test class

## Best Practices

- Keep page objects focused on single pages/components
- Use meaningful method names (e.g., `doLogin()`, `createProject()`)
- Add assertions in test methods, not in page objects
- Use constants for repeated values
- Take screenshots on test failures
- Keep tests independent and atomic

## Reporting

Test reports are generated in the `test-output/` directory:
- HTML reports
- Screenshots on failure
- Log files

## Browser Support

- Chromium (default)
- Firefox
- WebKit
- Chrome (via Chromium channel)

## Troubleshooting

- **Browser not launching**: Ensure Playwright browsers are installed
- **Element not found**: Check locators and wait for elements to be visible
- **Test failures**: Check screenshots in `test-output/screenshots/`
- **Dependency issues**: Run `mvn clean install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your tests or improvements
4. Update documentation if needed
5. Submit a pull request

## License

This test framework is licensed under the MIT License.