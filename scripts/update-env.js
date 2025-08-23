#!/usr/bin/env node
/**
 * CDK 출력값을 읽어서 프론트엔드 환경 변수를 자동 업데이트하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const CDK_OUTPUTS_PATH = path.join(__dirname, '../backend/cdk-outputs.json');
const FRONTEND_ENV_PATH = path.join(__dirname, '../frontend/.env');

try {
  // CDK 출력값 읽기
  const cdkOutputs = JSON.parse(fs.readFileSync(CDK_OUTPUTS_PATH, 'utf8'));
  
  const apiEndpoint = cdkOutputs.TodoAppApiStack?.ApiEndpoint;
  const identityPoolId = cdkOutputs.TodoAppAuthStack?.IdentityPoolId;
  const userPoolId = cdkOutputs.TodoAppAuthStack?.UserPoolId;
  const userPoolClientId = cdkOutputs.TodoAppAuthStack?.UserPoolClientId;
  
  if (!apiEndpoint || !identityPoolId) {
    console.error('❌ CDK 출력값에서 필수 정보를 찾을 수 없습니다.');
    process.exit(1);
  }
  
  // 환경 변수 파일 생성
  const envContent = `# API 설정
VITE_API_BASE_URL=${apiEndpoint.replace(/\/$/, '')}
VITE_API_REGION=ap-northeast-2

# Cognito 설정 (unauthenticated 사용자용)
VITE_COGNITO_IDENTITY_POOL_ID=${identityPoolId}
VITE_COGNITO_REGION=ap-northeast-2

# 개발 모드 설정
VITE_USE_LOCAL_STORAGE=false
`;

  fs.writeFileSync(FRONTEND_ENV_PATH, envContent);
  
  console.log('✅ 프론트엔드 환경 변수가 성공적으로 업데이트되었습니다:');
  console.log(`   API Endpoint: ${apiEndpoint}`);
  console.log(`   Identity Pool ID: ${identityPoolId}`);
  console.log(`   파일 위치: ${FRONTEND_ENV_PATH}`);
  
} catch (error) {
  console.error('❌ 환경 변수 업데이트 실패:', error.message);
  process.exit(1);
}