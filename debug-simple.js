const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 콘솔 메시지 수집
  page.on('console', msg => {
    console.log(`[브라우저 콘솔] ${msg.type()}: ${msg.text()}`);
  });
  
  console.log('브라우저에서 앱 로딩 중...');
  await page.goto('http://localhost:5173');
  
  // 5초 대기해서 API 호출 완료 기다림
  await page.waitForTimeout(5000);
  
  // 페이지 상태 확인
  console.log('\n페이지 제목:', await page.title());
  
  // 할일 목록이 표시되는지 확인
  const todos = await page.locator('table tbody tr').count();
  console.log('표시된 할일 개수:', todos);
  
  if (todos > 0) {
    console.log('✅ 할일 목록이 성공적으로 표시되었습니다!');
    const firstTodoText = await page.locator('table tbody tr').first().textContent();
    console.log('첫 번째 할일:', firstTodoText);
  } else {
    console.log('❌ 할일 목록이 표시되지 않았습니다.');
  }
  
  console.log('\n브라우저를 열어두어 수동 확인 가능');
  
  // 30초 대기
  await page.waitForTimeout(30000);
  
  await browser.close();
})();