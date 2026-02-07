// Manual mock for expo package to bypass winter runtime in tests
module.exports = {
  registerRootComponent: jest.fn(),
  // Add other exports as needed
};
