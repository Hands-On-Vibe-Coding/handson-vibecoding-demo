# Scripts - 유틸리티 스크립트

모노레포 전체에서 사용하는 재사용 가능한 유틸리티 스크립트를 관리합니다.

## 빠른 시작

```bash
# Makefile을 통한 편리한 스크립트 실행
make help              # 사용 가능한 모든 명령어 확인
make get-pages-url     # GitHub Pages URL 확인
make clean-data        # 테스트 데이터 정리
make add-issues        # GitHub Projects 이슈 관리 도구
```

## 목적

- **자동화**: 반복적인 작업 자동화 및 효율성 향상
- **재사용성**: 프로젝트 전반에서 활용 가능한 범용 도구
- **표준화**: 일관된 개발 워크플로우 지원
- **유지보수성**: 중앙화된 스크립트 관리 및 문서화

## 📋 스크립트 목록

### 🔧 개발 도구

#### `get-pages-url.sh`
**GitHub Pages 배포 URL 자동 확인**
```bash
make get-pages-url    # Makefile을 통한 실행
./get-pages-url.sh    # 직접 실행
```
- GitHub CLI를 사용하여 Pages 설정 확인
- E2E 테스트에서 동적 URL 사용 지원
- 저장소 정보 자동 감지

#### `get-api-endpoint.sh` 
**API 엔드포인트 URL 확인**
```bash
make get-api-endpoint
./get-api-endpoint.sh
```
- 파이프라인에서 API 엔드포인트 취득
- 배포된 백엔드 서비스 URL 확인

#### `clean-backend-data.sh`
**백엔드 테스트 데이터 정리**
```bash
make clean-data
./clean-backend-data.sh
```
- 개발/테스트 중 생성된 임시 데이터 정리
- 개발 환경 초기화

### 📊 GitHub Projects 관리 도구

#### `add-issues-to-project.sh`
**GitHub Projects 이슈 관리**
```bash
make add-issues                    # 도움말 확인
./add-issues-to-project.sh help    # 상세 사용법
./add-issues-to-project.sh label phase0
./add-issues-to-project.sh issues 33 50 51
./add-issues-to-project.sh isms    # 모든 ISMS-P 이슈 추가
./add-issues-to-project.sh status  # 프로젝트 현황
```
- GraphQL API를 활용한 이슈 자동 추가
- 라벨별, 번호별 이슈 그룹 관리
- ISMS-P 프로젝트 전용 기능

#### `set-project-schedule.sh`
**프로젝트 일정 관리**
```bash
make set-schedule                     # 도움말 확인
./set-project-schedule.sh all         # 전체 일정 설정
./set-project-schedule.sh phase 0     # 특정 Phase만
./set-project-schedule.sh fields      # 필드 정보 확인
```
- K-ISMS-P 32주 로드맵 기준 일정 설정
- Phase별 세분화된 스케줄링
- Start/End date 필드 자동 설정

#### `project-helper.sh`
**GitHub Projects API 헬퍼**
```bash
make project-help
./project-helper.sh
```
- GitHub Projects v2 API 활용 도구
- 이슈 관리 및 로드맵 최적화
- K-ISMS-P 인증 프로젝트 전용 헬퍼

## ⚙️ 시스템 요구사항

### 필수 도구
- **GitHub CLI**: `gh` 명령어 설치 및 인증 필요
- **Git**: origin 원격 저장소 설정
- **Make**: Makefile 실행을 위한 make 도구

### 설정 확인
```bash
# GitHub CLI 설치 및 인증 확인
gh --version
gh auth status

# Git 원격 저장소 확인
git remote -v

# Make 도구 확인
make --version
```

## 💡 사용 사례

### E2E 테스트 자동화
```bash
# GitHub Pages 배포된 사이트 테스트
PLAYWRIGHT_BASE_URL=$(make get-pages-url) npm run test:e2e:remote

# API 엔드포인트 동적 설정
API_URL=$(make get-api-endpoint) npm run test:integration
```

### K-ISMS-P 프로젝트 관리
```bash
# 1. 모든 ISMS-P 이슈를 프로젝트에 추가
make add-issues
./add-issues-to-project.sh isms

# 2. 32주 로드맵 일정 설정
make set-schedule  
./set-project-schedule.sh all

# 3. 프로젝트 현황 확인
./add-issues-to-project.sh status
```

### CI/CD 파이프라인 통합
```yaml
# .github/workflows/deploy.yml
- name: Get deployment URLs
  run: |
    PAGES_URL=$(cd scripts && make get-pages-url)
    API_URL=$(cd scripts && make get-api-endpoint)
    echo "PAGES_URL=$PAGES_URL" >> $GITHUB_ENV
    echo "API_URL=$API_URL" >> $GITHUB_ENV

- name: Run E2E tests
  run: PLAYWRIGHT_BASE_URL="$PAGES_URL" npm run test:e2e
```

## 🛠️ 개발자 가이드

### 새 스크립트 추가 절차
1. **스크립트 생성**: `scripts/` 디렉토리에 `.sh` 파일 생성
2. **권한 설정**: `chmod +x scripts/new-script.sh`
3. **Makefile 업데이트**: 새 스크립트를 Makefile에 추가
4. **README 문서화**: 사용법 및 예시 추가
5. **테스트**: 다양한 환경에서 동작 검증

### 스크립트 작성 표준
```bash
#!/bin/bash
# 스크립트 목적과 기능 명시
# 사용법 예시 포함

set -e  # 오류 발생 시 즉시 종료

# 요구사항 검증
function check_requirements() {
    if ! command -v required_tool &> /dev/null; then
        echo "❌ 필수 도구가 설치되지 않았습니다." >&2
        exit 1
    fi
}

function main() {
    check_requirements
    # 메인 로직 구현
}

main "$@"
```

### 모범 사례
- **오류 처리**: 철저한 예외 상황 대응
- **사용자 경험**: 명확한 출력 메시지와 진행 상황 표시
- **재사용성**: 범용적으로 활용 가능한 구조
- **문서화**: 주석과 README를 통한 상세 설명
- **표준화**: 일관된 코딩 스타일 유지

## 📝 Makefile 사용법

### 주요 명령어
```bash
make help           # 모든 사용 가능한 명령어 확인
make clean-data     # 테스트 데이터 정리
make get-pages-url  # GitHub Pages URL 확인
make add-issues     # GitHub Projects 이슈 관리
make set-schedule   # 프로젝트 일정 설정
```

### 고급 사용법
```bash
# 여러 작업을 순차적으로 실행
make clean-data && make setup-project

# 특정 스크립트를 직접 실행하면서 인수 전달
./add-issues-to-project.sh label phase0
./set-project-schedule.sh phase 1
```

## 🔧 실제 활용 시나리오

### 일일 개발 워크플로우
```bash
# 1. 개발 환경 정리
make clean-data

# 2. 배포 URL 확인
make get-pages-url
make get-api-endpoint

# 3. 프로젝트 관리 (필요시)
make add-issues
./add-issues-to-project.sh status
```

### K-ISMS-P 프로젝트 초기 설정
```bash
# 1. 모든 관련 이슈를 프로젝트에 추가
./add-issues-to-project.sh isms

# 2. 32주 로드맵 일정 설정
./set-project-schedule.sh all

# 3. 프로젝트 현황 확인
./add-issues-to-project.sh status

# 4. 로드맵 확인
echo "🔗 로드맵: https://github.com/orgs/Hands-On-Vibe-Coding/projects/2/views/4"
```

## 🔍 문제 해결

### 일반적인 오류 및 해결책

| 문제 | 원인 | 해결책 |
|------|------|--------|
| `command not found: make` | Make 미설치 | `brew install make` (macOS) |
| `Permission denied` | 실행 권한 없음 | `chmod +x scripts/*.sh` |
| `gh: command not found` | GitHub CLI 미설치 | `brew install gh` |
| `gh auth status: failed` | 인증 실패 | `gh auth login` |
| `No such file or directory` | 잘못된 경로 | 프로젝트 루트에서 실행 |

### 디버깅 방법
```bash
# 상세한 실행 로그 확인
bash -x ./script-name.sh

# 오류 메시지만 확인
./script-name.sh 2>&1 >/dev/null

# Makefile 디버깅
make -n command  # 실제 실행 없이 명령어만 출력
```

### 도움말 및 지원
- **스크립트 도움말**: 각 스크립트는 `help` 옵션 지원
- **Makefile 도움말**: `make help`로 모든 명령어 확인
- **프로젝트 문서**: [../docs/](../docs/) 참고
- **GitHub Issues**: 버그 리포트 및 기능 요청

---

📚 **더 자세한 정보**는 [프로젝트 문서](../docs/)를 참고하세요.