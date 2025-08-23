const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 콘솔 메시지 수집
  page.on('console', msg => {
    console.log(`[브라우저 콘솔] ${msg.type()}: ${msg.text()}`);
  });
  
  // 네트워크 요청 수집
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('amazonaws')) {
      console.log(`[네트워크 요청] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('amazonaws')) {
      console.log(`[네트워크 응답] ${response.status()} ${response.url()}`);
    }
  });
  
  console.log('브라우저에서 앱 로딩 중...');
  await page.goto('http://localhost:5173');
  
  // 초기 로딩 대기
  await page.waitForTimeout(3000);
  
  console.log('\n현재 Todo 개수 확인...');
  const initialCount = await page.locator('table tbody tr').count();
  console.log('초기 Todo 개수:', initialCount);
  
  console.log('\n새로운 Todo 추가 테스트...');
  
  // Todo 입력
  await page.fill('[data-testid="todo-input"]', 'E2E 테스트 Todo');
  console.log('✓ Todo 텍스트 입력 완료');
  
  // 추가 버튼 클릭
  await page.click('[data-testid="add-todo-button"]');
  console.log('✓ 추가 버튼 클릭 완료');
  
  // API 호출 완료 대기
  await page.waitForTimeout(3000);
  
  console.log('\n결과 확인...');
  const finalCount = await page.locator('table tbody tr').count();
  console.log('최종 Todo 개수:', finalCount);
  
  if (finalCount > initialCount) {
    console.log('✅ Todo 추가 성공!');
    const newTodoText = await page.locator('table tbody tr').last().textContent();
    console.log('새로 추가된 Todo:', newTodoText);
  } else {
    console.log('❌ Todo 추가 실패');
  }
  
  console.log('\n체크박스 테스트...');
  const checkbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
  const isChecked = await checkbox.isChecked();
  console.log('체크박스 초기 상태:', isChecked ? '체크됨' : '체크 안됨');
  
  await checkbox.click();
  await page.waitForTimeout(2000);
  
  const isCheckedAfter = await checkbox.isChecked();
  console.log('체크박스 클릭 후 상태:', isCheckedAfter ? '체크됨' : '체크 안됨');
  
  if (isChecked !== isCheckedAfter) {
    console.log('✅ 체크박스 토글 성공!');
  } else {
    console.log('❌ 체크박스 토글 실패');
  }
  
  console.log('\n30초 대기 - 수동 확인 가능');
  await page.waitForTimeout(30000);
  
  await browser.close();
})();