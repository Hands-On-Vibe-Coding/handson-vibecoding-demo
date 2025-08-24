# 트러블슈팅 가이드

> **마지막 업데이트**: 2025-08-18  
> **프로젝트**: Todo App Monorepo (handson-vibecoding-demo)

## 목차

1. [CI/CD 파이프라인 문제](#cicd-파이프라인-문제)
2. [GitHub Actions 워크플로우](#github-actions-워크플로우)
3. [빌드 및 테스트 오류](#빌드-및-테스트-오류)
4. [AWS 배포 문제](#aws-배포-문제)
5. [프론트엔드 관련 문제](#프론트엔드-관련-문제)
6. [백엔드 관련 문제](#백엔드-관련-문제)
7. [의존성 및 패키지 관리](#의존성-및-패키지-관리)
8. [Pre-commit Hook 문제](#pre-commit-hook-문제)

---

## CI/CD 파이프라인 문제

### 1. GitHub Actions 배포 스킵 문제

**증상**: 코드 변경이 있음에도 불구하고 GitHub Actions가 배포를 건너뛰는 현상

**원인**:

- `paths-filter`가 workflow_run 이벤트에서 제대로 작동하지 않음
- 워크플로우 간 의존성 문제

**해결 방법**:

```yaml
# workflow_run 대신 push 이벤트에서 직접 paths 체크
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - 'shared/**'
      - '.github/workflows/frontend.yml'
```

**참조 커밋**: `8d11ff6d`, `7e7c237b`

### 2. OIDC 인증 실패

**증상**: AWS 배포 시 인증 오류 발생

**원인**: GitHub OIDC Provider와 AWS IAM Role 간 신뢰 관계 설정 문제

**해결 방법**:

1. AWS IAM Role에 GitHub OIDC Provider 신뢰 관계 추가
2. 올바른 Role ARN 사용
3. 권한 정책 확인

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ap-northeast-2
```

**참조 커밋**: `84484710`, `25bbefdd`

### 3. 중복 워크플로우 실행

**증상**: 동일한 워크플로우가 여러 번 실행됨

**원인**: push와 pull_request 이벤트가 동시에 트리거됨

**해결 방법**:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

**참조 커밋**: `323709e0`

---

## GitHub Actions 워크플로우

### 1. Paths Filter 오류

**증상**: workflow_run에서 paths-filter 액션이 작동하지 않음

**원인**: workflow_run 이벤트는 파일 변경 감지를 지원하지 않음

**해결 방법**:

```bash
# Git diff를 사용한 수동 변경사항 감지
git diff --name-only HEAD^ HEAD | grep -E "^(frontend|shared)/" && echo "changed"
```

**참조 커밋**: `be81107b`, `a3bb4414`

### 2. Package-lock.json 동기화 문제

**증상**: CI에서 package-lock.json 불일치로 인한 빌드 실패

**원인**: 로컬과 CI 환경 간 npm 버전 차이

**해결 방법**:

```bash
# 모든 워크스페이스에서 package-lock.json 재생성
npm install --workspaces --include-workspace-root
git add package-lock.json */package-lock.json
git commit -m "fix: sync package-lock.json across workspaces"
```

**참조 커밋**: `8db06732`

---

## 빌드 및 테스트 오류

### 1. Playwright 비주얼 테스트 실패

**증상**: CI 환경에서 비주얼 회귀 테스트 실패

**원인**:

- OS별로 다른 렌더링 결과
- 스냅샷 파일 누락

**해결 방법**:

```bash
# Linux 환경용 스냅샷 생성
npm run test:e2e:update

# CI에서 스냅샷 자동 생성 (첫 실행 시)
if [ ! -d "frontend/e2e/__screenshots__/linux" ]; then
  npm run test:e2e:update
fi
```

**참조 커밋**: `65b2a657`, `d38f1eed`

### 2. 백엔드 테스트 실패

**증상**: Jest 테스트 실행 시 타입 오류 또는 모듈 찾을 수 없음

**원인**:

- TypeScript 설정 문제
- 모듈 경로 해석 오류

**해결 방법**:

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

```javascript
// backend/jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

**참조 커밋**: `ed77cba9`, `30f7cc70`

---

## AWS 배포 문제

### 1. CDK 배포 실패

**증상**: CDK deploy 명령 실행 시 오류

**원인**:

- AWS 자격 증명 문제
- CDK 부트스트랩 누락
- 리소스 제한 초과

**해결 방법**:

```bash
# CDK 부트스트랩 실행
npx cdk bootstrap aws://ACCOUNT-ID/REGION

# 스택별 개별 배포
cd backend
npx cdk deploy TodoAppDatabaseStack
npx cdk deploy TodoAppLambdaStack
npx cdk deploy TodoAppApiStack
```

### 2. Lambda 함수 콜드 스타트

**증상**: 첫 요청 시 응답 시간이 매우 느림

**원인**: Lambda 콜드 스타트

**해결 방법**:

```typescript
// Provisioned Concurrency 설정
const fn = new lambda.Function(this, 'Function', {
  // ... 기타 설정
  reservedConcurrentExecutions: 5,
});

// 또는 Lambda 워밍 설정
new events.Rule(this, 'WarmingRule', {
  schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
  targets: [new targets.LambdaFunction(fn)],
});
```

---

## 프론트엔드 관련 문제

### 1. Vite HMR (Hot Module Replacement) 작동 안 함

**증상**: 코드 변경 시 자동 새로고침이 되지 않음

**원인**: Vite 서버 설정 문제

**해결 방법**:

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true, // Docker 환경에서 필요
    },
    hmr: {
      overlay: true,
    }
  }
});
```

### 2. Mantine UI 스타일 적용 안 됨

**증상**: Mantine 컴포넌트 스타일이 제대로 표시되지 않음

**원인**: CSS-in-JS 설정 누락

**해결 방법**:

```tsx
// frontend/src/main.tsx
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

root.render(
  <MantineProvider>
    <App />
  </MantineProvider>
);
```

---

## 백엔드 관련 문제

### 1. DynamoDB Local 연결 실패

**증상**: 로컬 개발 시 DynamoDB 연결 오류

**원인**: DynamoDB Local이 실행되지 않음

**해결 방법**:

```bash
# Docker로 DynamoDB Local 실행
docker run -p 8000:8000 amazon/dynamodb-local

# 또는 Java로 직접 실행
java -Djava.library.path=./DynamoDBLocal_lib \
     -jar DynamoDBLocal.jar -sharedDb
```

### 2. Lambda 로컬 테스트

**증상**: Lambda 함수를 로컬에서 테스트하기 어려움

**원인**: AWS 환경과 로컬 환경의 차이

**해결 방법**:

```bash
# SAM CLI 사용
sam local start-api

# 또는 단위 테스트로 비즈니스 로직 검증
npm run backend:test
```

---

## 의존성 및 패키지 관리

### 1. Workspace 의존성 문제

**증상**: shared 모듈 변경이 다른 워크스페이스에 반영되지 않음

**원인**: 심볼릭 링크 또는 빌드 순서 문제

**해결 방법**:

```bash
# 모든 워크스페이스 재빌드
npm run build:all

# 순서대로 빌드
npm run shared:build && npm run backend:build && npm run frontend:build
```

### 2. Node 버전 불일치

**증상**: 로컬과 CI 환경에서 다른 동작

**원인**: Node.js 버전 차이

**해결 방법**:

```bash
# .nvmrc 파일 생성
echo "22.13.1" > .nvmrc

# nvm 사용
nvm use
```

---

## Pre-commit Hook 문제

### 1. Pre-commit Hook 실행 안 됨

**증상**: 커밋 시 린트나 테스트가 실행되지 않음

**원인**: Husky 설치 문제

**해결 방법**:

```bash
# Husky 재설치
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
chmod +x .husky/pre-commit
```

**참조 커밋**: `dfdc4a17`

### 2. Pre-commit이 너무 느림

**증상**: 커밋할 때마다 오래 기다려야 함

**원인**: 모든 파일에 대해 테스트 실행

**해결 방법**:

```bash
# 변경된 파일만 검사하도록 수정
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 변경된 파일만 대상으로 lint와 test 실행
npx lint-staged
```

---

## 일반적인 디버깅 팁

### 1. 로그 레벨 상세 설정

```bash
# npm 디버그 모드
npm install --loglevel verbose

# GitHub Actions 디버그
ACTIONS_RUNNER_DEBUG=true
ACTIONS_STEP_DEBUG=true
```

### 2. 캐시 초기화

```bash
# npm 캐시 정리
npm cache clean --force

# CDK 캐시 정리
rm -rf cdk.out
```

### 3. 의존성 완전 재설치

```bash
# 모든 node_modules 제거
rm -rf node_modules */node_modules */*/node_modules

# package-lock.json 제거
rm -f package-lock.json */package-lock.json

# 새로 설치
npm install
```



## 추가 리소스

- [프로젝트 README](../README.md)
- [아키텍처 문서](./design/architecture.md)
- [DevOps 가이드](./DevOps/README.md)
- [GitHub Issues](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/issues)

---

## 기여 가이드

이 문서에 새로운 트러블슈팅 사례를 추가하려면:

1. 문제 증상을 명확히 기술
2. 근본 원인 분석 포함
3. 해결 방법을 단계별로 설명
4. 관련 커밋이나 이슈 번호 참조
5. 테스트된 해결책만 문서화

---

**문서 버전**: 1.0.0  
**작성자**: Claude Code Assistant  
**라이선스**: MIT
