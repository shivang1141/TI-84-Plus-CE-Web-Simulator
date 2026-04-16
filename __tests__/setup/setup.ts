// Global test setup
// Suppress console.error/warn in tests unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Allow through critical errors
    if (typeof args[0] === 'string' && args[0].includes('CRITICAL')) {
      originalError(...args);
    }
  };
  console.warn = () => {};
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
