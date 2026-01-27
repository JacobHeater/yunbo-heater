# End-to-End Tests

This directory contains end-to-end tests for the Yunbo Heater piano lessons website using Playwright.

## Setup

The tests are configured to run against a local development server. Make sure you have the application running before executing tests.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test login.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
```

## Test Coverage

### Login Tests (`login.spec.ts`)

- ✅ Form display and validation
- ✅ Invalid credentials handling
- ✅ Successful login flow
- ✅ Session persistence
- ✅ Authentication redirects
- ✅ Logout functionality
- ✅ Mobile responsiveness

## Test Accounts

For testing purposes, the application includes a fallback test account:
- **Email**: `test@yunboheater.com`
- **Password**: `test123`

## Configuration

Tests are configured in `playwright.config.ts` with:
- Multiple browser support (Chrome, Firefox, Safari, WebKit)
- Mobile viewport testing
- Automatic dev server startup
- Parallel test execution
- HTML reporting

## Debugging

### View test results
```bash
npx playwright show-report
```

### Debug mode
```bash
npx playwright test --debug
```

### Trace viewer
Traces are automatically collected on test failures. View them with:
```bash
npx playwright show-trace test-results/*/trace.zip
```

## CI/CD

The tests are configured to work in CI environments with:
- Automatic browser installation
- Parallel execution disabled
- Retry logic for flaky tests
- HTML reporting

## Browser Support

Tests run on:
- Desktop Chrome
- Desktop Firefox
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)