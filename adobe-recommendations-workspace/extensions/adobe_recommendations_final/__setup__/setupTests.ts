// eslint-disable-next-line
import "@testing-library/jest-dom/extend-expect";
// eslint-disable-next-line
import "@testing-library/jest-dom";

const useMarketplaceContextReturnedValue = {
  bootstrap: {},
  locale: "en-US",
  localizedStrings: {
    "my.string": "translated string",
  },
};

jest.mock("../src/hooks/useMarketplaceContext", () =>
  jest.fn(() => useMarketplaceContextReturnedValue)
);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
