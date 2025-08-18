export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'https://mock-api.test',
        VITE_COGNITO_REGION: 'ap-northeast-2',
        VITE_COGNITO_IDENTITY_POOL_ID: 'ap-northeast-2:mock-pool-id'
      }
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@vibecoding-demo/shared/src/(.*)$': '<rootDir>/../shared/src/$1',
    '^@vibecoding-demo/shared$': '<rootDir>/../shared/dist',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        module: 'esnext',
        target: 'es2020',
        moduleResolution: 'node'
      }
    }]
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
