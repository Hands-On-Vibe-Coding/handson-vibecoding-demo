import { test as base } from '@playwright/test';

/**
 * E2E 테스트용 Hooks - 백엔드 데이터 정리
 */

const API_BASE_URL = 'https://tb94v9s3jb.execute-api.ap-northeast-2.amazonaws.com/prod';

/**
 * 백엔드의 모든 Todo 데이터를 정리하는 함수
 */
async function cleanBackendData() {
  try {
    console.log('🧹 백엔드 테스트 데이터 정리 시작...');
    
    // 모든 Todo 가져오기
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) {
      console.log('⚠️  백엔드에서 데이터를 가져올 수 없습니다.');
      return;
    }
    
    const todos = await response.json();
    
    if (!Array.isArray(todos) || todos.length === 0) {
      console.log('✅ 정리할 데이터가 없습니다.');
      return;
    }
    
    console.log(`📋 총 ${todos.length}개의 Todo 항목을 삭제합니다...`);
    
    // 각 Todo 삭제
    let deletedCount = 0;
    for (const todo of todos) {
      try {
        const deleteResponse = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          deletedCount++;
        } else {
          console.log(`❌ 삭제 실패: ${todo.id} (HTTP ${deleteResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ 삭제 오류: ${todo.id} -`, error);
      }
      
      // API 요청 제한 방지
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`🎉 정리 완료: ${deletedCount}/${todos.length}개 항목 삭제`);
    
  } catch (error) {
    console.log('❌ 백엔드 데이터 정리 중 오류:', error);
  }
}

/**
 * 테스트 격리를 위한 커스텀 Test 확장
 */
export const test = base.extend({
  // 각 테스트 전후에 백엔드 데이터 정리
  page: async ({ page }, testPage) => {
    // 테스트 시작 전 데이터 정리
    await cleanBackendData();
    
    // 테스트 실행
    await testPage(page);
    
    // 테스트 종료 후 데이터 정리 (선택사항)
    // await cleanBackendData();
  },
});

export { expect } from '@playwright/test';