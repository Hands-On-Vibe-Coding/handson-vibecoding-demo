import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 각 테스트 파일의 최대 실행 시간 */
  timeout: 60 * 1000,
  /* 테스트 실행 전 기다릴 시간 */
  expect: {
    timeout: 15000
  },
  /* 테스트 실행 시 리포터 설정 */
  reporter: [
    ['html'],
    ['list']
  ],
  /* 테스트 실행 간 공유할 수 있는 전역 설정 */
  use: {
    /* 모든 요청에 대한 기본 URL - 환경변수 우선, 없으면 로컬 개발 서버 */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    /* 모든 테스트에서 자동으로 스크린샷 캡처 */
    screenshot: 'only-on-failure',
    /* 모든 테스트에서 트레이스 수집 */
    trace: 'on-first-retry',
  },

  /* 테스트를 시리얼 모드로 실행 - 테스트 간 데이터 충돌 방지 */
  workers: 1,
  fullyParallel: false,

  /* 테스트 실행 환경 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* 모바일 뷰포트 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 로컬 개발 서버 설정 - CI 환경이거나 외부 URL 사용 시 비활성화 */
  ...(!process.env.CI && !process.env.PLAYWRIGHT_BASE_URL && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  }),
});
