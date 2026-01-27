# Backend Tests

This directory contains comprehensive unit tests for the backend CLI project.

## Test Structure

- **ping-command.test.ts** - Tests for the PingCommand
- **calculate-command.test.ts** - Tests for the CalculateCommand (arithmetic operations)
- **command-registry.test.ts** - Tests for the CommandRegistry (command registration and retrieval)
- **command-handler.test.ts** - Tests for the CommandHandler (command execution)
- **zip-helper.test.ts** - Tests for the ZipHelper (ZIP file operations)

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Run specific test file

```bash
npm test ping-command.test.ts
```

## Test Framework

- **Jest** - JavaScript testing framework
- **ts-jest** - TypeScript preprocessor for Jest
- **@types/jest** - TypeScript type definitions for Jest

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Writing New Tests

1. Create a new test file in this directory with the `.test.ts` extension
2. Import the module you want to test
3. Write your test cases using Jest's `describe`, `it`, and `expect` functions
4. Run `npm test` to execute your new tests

### Example Test Structure

```typescript
import { YourModule } from '../your-module.js';

describe('YourModule', () => {
  describe('yourMethod', () => {
    it('should do something', () => {
      const result = YourModule.yourMethod();
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Test Coverage Goals

- Aim for >80% code coverage
- Test all public methods
- Test edge cases and error conditions
- Test with various input types (valid, invalid, null, undefined)
