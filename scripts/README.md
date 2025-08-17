# Scripts - 유틸리티 스크립트

모노레포 전체에서 사용하는 유틸리티 스크립트를 관리합니다.

## 목적

- **자동화**: 반복적인 작업 자동화
- **개발 효율성**: 개발자 생산성 향상
- **일관성**: 표준화된 스크립트 제공
- **유지보수성**: 중앙화된 스크립트 관리

## 스크립트 목록

### `get-pages-url.sh`
GitHub Pages 배포 URL을 자동으로 가져오는 스크립트입니다.

#### 기능
- GitHub CLI를 사용하여 Pages 설정 확인
- 저장소 정보 자동 감지 (origin 원격 저장소 기준)
- 표준 GitHub Pages URL 생성
- E2E 테스트에서 동적 URL 사용 지원

#### 사용법
```bash
# 기본 사용법
./scripts/get-pages-url.sh

# Playwright E2E 테스트에서 자동 사용
npm run test:e2e:pages

# 환경변수로 URL 설정
PLAYWRIGHT_BASE_URL=$(./scripts/get-pages-url.sh) npm run test:e2e:remote
```

#### 요구사항
- **GitHub CLI**: `gh` 명령어 설치 필요
- **인증**: `gh auth login` 인증 완료
- **Git 저장소**: origin 원격 저장소 설정
- **GitHub Pages**: 저장소에서 Pages 활성화

#### 출력 예시
```bash
$ ./scripts/get-pages-url.sh
📍 저장소: roboco-io/handson-vibecoding-demo
🌐 GitHub Pages URL: https://roboco-io.github.io/handson-vibecoding-demo/
https://roboco-io.github.io/handson-vibecoding-demo/
```

#### 오류 처리
- GitHub CLI 미설치 시 설치 가이드 제공
- 인증 미완료 시 인증 명령어 안내
- Pages 미설정 시 설정 방법 안내
- Git 저장소 문제 시 상세 오류 메시지

## 실제 사용 사례

### E2E 테스트 통합
프론트엔드 package.json에서 다음과 같이 사용됩니다:

```json
{
  "scripts": {
    "test:e2e:pages": "PLAYWRIGHT_BASE_URL=$(../scripts/get-pages-url.sh 2>/dev/null) playwright test",
    "test:e2e:pages:noreport": "PLAYWRIGHT_BASE_URL=$(../scripts/get-pages-url.sh 2>/dev/null) playwright test --reporter=line"
  }
}
```

### CI/CD 파이프라인에서 활용
```yaml
# .github/workflows/e2e-test.yml
- name: Run E2E tests against GitHub Pages
  run: |
    PAGES_URL=$(./scripts/get-pages-url.sh)
    echo "Testing against: $PAGES_URL"
    cd frontend && PLAYWRIGHT_BASE_URL="$PAGES_URL" npm run test:e2e
```

## 스크립트 개발 가이드

### 새 스크립트 추가
1. `scripts/` 디렉토리에 스크립트 파일 생성
2. 실행 권한 설정: `chmod +x scripts/new-script.sh`
3. 스크립트 헤더 추가 (목적, 사용법 주석)
4. 오류 처리 로직 포함
5. README.md에 문서화

### 코딩 규칙
```bash
#!/bin/bash

# 스크립트 목적과 기능 설명
# 사용법 예시 포함

set -e  # 오류 시 즉시 종료

# 함수 정의 (필요시)
function check_requirements() {
    # 요구사항 검증 로직
}

# 메인 로직
function main() {
    check_requirements
    # 실제 작업 수행
}

# 스크립트 실행
main "$@"
```

### 모범 사례
- **오류 처리**: `set -e`로 오류 시 즉시 종료
- **사용자 피드백**: stderr로 진행 상황 출력, stdout은 결과만
- **검증**: 외부 의존성 및 요구사항 사전 확인
- **문서화**: 스크립트 목적과 사용법 주석 작성
- **이식성**: 다양한 환경에서 동작하도록 고려

### 공통 패턴
```bash
# 명령어 존재 확인
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI가 설치되지 않았습니다." >&2
    exit 1
fi

# 변수 검증
if [[ -z "$REQUIRED_VAR" ]]; then
    echo "❌ 필수 변수가 설정되지 않았습니다." >&2
    exit 1
fi

# 정규식 매칭
if [[ "$URL" =~ ^https://github\.com/([^/]+)/([^/]+) ]]; then
    OWNER="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]}"
fi

# 조건부 실행
RESULT=$(command 2>/dev/null || echo "default_value")
```

## 향후 스크립트 계획

### 배포 자동화
- `deploy-frontend.sh`: GitHub Pages 배포 자동화
- `deploy-backend.sh`: AWS CDK 배포 자동화
- `deploy-full.sh`: 전체 스택 배포

### 개발 환경 설정
- `setup-dev.sh`: 로컬 개발 환경 초기화
- `reset-env.sh`: 개발 환경 초기화
- `check-health.sh`: 시스템 상태 확인

### 테스트 및 품질
- `run-all-tests.sh`: 전체 워크스페이스 테스트
- `lint-all.sh`: 전체 코드베이스 린팅
- `coverage-report.sh`: 통합 커버리지 리포트

### 데이터 관리
- `backup-data.sh`: 중요 데이터 백업
- `migrate-data.sh`: 데이터 마이그레이션
- `sync-config.sh`: 설정 파일 동기화

## 사용 예시

### 로컬 개발 중 E2E 테스트
```bash
# 1. 프론트엔드 빌드 및 배포
cd frontend && npm run build

# 2. GitHub Pages URL 확인
./scripts/get-pages-url.sh

# 3. 배포된 사이트에 대해 E2E 테스트 실행
npm run test:e2e:pages
```

### CI/CD 파이프라인에서
```bash
# GitHub Actions workflow에서
- name: Get deployment URL
  id: get-url
  run: echo "url=$(./scripts/get-pages-url.sh)" >> $GITHUB_OUTPUT

- name: Run tests
  run: PLAYWRIGHT_BASE_URL="${{ steps.get-url.outputs.url }}" npm run test:e2e
```

## 문제 해결

### 일반적인 문제
1. **권한 오류**: `chmod +x scripts/script-name.sh`로 실행 권한 부여
2. **GitHub CLI 인증**: `gh auth login`으로 재인증
3. **Pages 설정**: GitHub 저장소 Settings > Pages에서 활성화
4. **스크립트 경로**: 모노레포 루트에서 실행

### 디버깅
```bash
# 스크립트 디버깅 모드
bash -x ./scripts/get-pages-url.sh

# 오류 출력만 확인
./scripts/get-pages-url.sh 2>&1 >/dev/null

# 성공 출력만 확인
./scripts/get-pages-url.sh 2>/dev/null
```

더 자세한 내용은 [프로젝트 문서](../docs/)를 참고하세요.