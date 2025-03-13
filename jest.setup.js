import '@testing-library/jest-dom';

// Mock window properties that might be undefined in the test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Mock import.meta.env for Jest tests
global.import = {
  meta: {
    env: {
      VITE_APPWRITE_URL: 'https://cloud.appwrite.io/v1',
      VITE_APPWRITE_PROJECT_ID: '67ac45480006eb807886',
      VITE_APPWRITE_DATABASE_ID: '67ad642100132ba1c7ce',
      VITE_APPWRITE_STORAGE_ID: '67ad63f60037fa138655',
      VITE_APPWRITE_SAVES_COLLECTION_ID: '67ad64bc002fbc8306ba',
      VITE_APPWRITE_USER_COLLECTION_ID: '67ad64a90011c044bf37',
      VITE_APPWRITE_POST_COLLECTION_ID: '67ad646a00278adc73f5',
      VITE_APPWRITE_FOLLOWS_COLLECTION_ID: '67b97d92000bfdc1aeed',
      VITE_APPWRITE_COMMENTS_COLLECTION_ID: '67bbf88100358bdf6eea',
      VITE_APPWRITE_MESSAGES_COLLECTION_ID: '67c4fbb3000ef387b2a0',
      VITE_GIPHY_API_KEY: '1zgDe31aMEKUHcOawZ6mmJPlrAKnturS',
      // Add any other environment variables your app needs
    },
  },
};
