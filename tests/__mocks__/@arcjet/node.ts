// Mock for @arcjet/node - provides stubs for all Arcjet functions used in the app
export const slidingWindow = jest.fn(() => ({ type: "slidingWindow" }));
export const shield = jest.fn(() => ({ type: "shield" }));
export const detectBot = jest.fn(() => ({ type: "detectBot" }));

const arcjet = jest.fn(() => ({
  withRule: jest.fn().mockReturnThis(),
  protect: jest.fn().mockResolvedValue({
    isDenied: () => false,
    reason: {
      isBot: () => false,
      isRateLimit: () => false,
      isShield: () => false,
    },
  }),
}));

export default arcjet;
