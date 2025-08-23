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
  
  // 5초 대기
  await page.waitForTimeout(5000);
  
  console.log('\n새로운 Todo 추가 테스트...');
  await page.fill('[data-testid="todo-input"]', 'API 테스트 Todo');
  await page.click('[data-testid="add-todo-button"]');
  
  // 5초 더 대기
  await page.waitForTimeout(5000);
  
  console.log('\n테스트 완료. 브라우저를 열어두어 수동 확인 가능');
  
  // 브라우저를 닫지 않고 대기
  await page.waitForTimeout(30000);
  
  await browser.close();
})();