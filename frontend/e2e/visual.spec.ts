import { test, expect } from './hooks';

/**
 * Todo 앱 시각적 회귀 테스트
 * 
 * 이 테스트 파일은 Todo 앱의 UI가 예상대로 렌더링되는지 확인합니다:
 * - 데스크톱 뷰 레이아웃
 * - 모바일 뷰 레이아웃
 * - 다크 모드 (지원되는 경우)
 */
test.describe('시각적 회귀 테스트', () => {
  // 각 테스트 전에 앱 페이지로 이동하고 로컬 스토리지 초기화
  test.beforeEach(async ({ page, baseURL }) => {
    // 앱 페이지로 이동 (전체 URL 사용)
    await page.goto(baseURL || '/');
    
    // 로컬 스토리지 초기화
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // React 앱이 완전히 로드될 때까지 대기
    await page.waitForSelector('[data-testid="todo-input"]', { timeout: 10000 });
    
    // 테스트용 Todo 항목 추가
    await page.getByTestId('todo-input').fill('첫 번째 할 일');
    await page.getByTestId('add-todo-button').click();
  });

  test('데스크톱 뷰 레이아웃', async ({ page }) => {
    // 데스크톱 화면 크기 설정
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 페이지가 로드될 때까지 기다림 (더 관대한 조건)
    await page.waitForLoadState('domcontentloaded');
    
    // Todo 리스트가 로드될 때까지 기다림
    await page.waitForTimeout(2000); // 애니메이션과 렌더링 완료를 위한 충분한 대기
    
    // 추가 대기 (애니메이션 완료)
    await page.waitForTimeout(1000);
    
    // 스크린샷 찍고 비교 - 첫 실행 시에는 스크린샷 생성
    await expect(page).toHaveScreenshot('main-desktop.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('모바일 뷰 레이아웃', async ({ page }) => {
    // 모바일 화면 크기 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 페이지가 로드될 때까지 기다림 (더 관대한 조건)
    await page.waitForLoadState('domcontentloaded');
    
    // Todo 리스트가 로드될 때까지 기다림
    await page.waitForTimeout(2000); // 애니메이션과 렌더링 완료를 위한 충분한 대기
    
    // 추가 대기 (애니메이션 완료)
    await page.waitForTimeout(1000);
    
    // 스크린샷 찍고 비교 - 첫 실행 시에는 스크린샷 생성
    await expect(page).toHaveScreenshot('main-mobile.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('다크 모드 전환', async ({ page }) => {
    // 데스크톱 화면 크기 설정
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('domcontentloaded');
    
    // Todo 리스트가 로드될 때까지 기다림
    await page.waitForTimeout(2000); // 애니메이션과 렌더링 완료를 위한 충분한 대기
    
    // 다크 모드 전환 버튼이 있는지 확인
    const darkModeButton = page.getByRole('button', { name: '테마 전환' });
    
    if (await darkModeButton.isVisible()) {
      // 다크 모드로 전환
      await darkModeButton.click();
      
      // 페이지가 다크 모드로 변경될 때까지 기다림
      await page.waitForTimeout(1000);
      
      // 스크린샷 찍고 비교 - 첫 실행 시에는 스크린샷 생성
      await expect(page).toHaveScreenshot('main-desktop-dark.png', {
        maxDiffPixelRatio: 0.05
      });
    } else {
      test.skip();
      console.log('다크 모드 전환 버튼을 찾을 수 없습니다.');
    }
  });
});
