# Vibecoding TODO App Monorepo

[![Common CI](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/workflows/Common%20CI/badge.svg)](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/actions/workflows/common.yml)
[![Frontend CI/CD](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/workflows/Frontend%20CI%2FCD/badge.svg)](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/actions/workflows/frontend.yml)
[![Backend CI/CD](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/workflows/Backend%20CI%2FCD/badge.svg)](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/actions/workflows/backend.yml)

이 프로젝트는 모던 웹 개발 및 인프라 자동화 베스트 프랙티스를 반영한 TODO 앱 모노레포입니다.

## 주요 특징

- **모노레포 구조**: 프론트엔드, 백엔드, 공유 모듈, 문서, 스크립트 통합 관리
- **프론트엔드**: React 19, Mantine UI 7, TypeScript, Vite 기반
- **백엔드**: Node.js 22, TypeScript, Clean Architecture, TDD, AWS Lambda
- **공유 모듈(shared)**: 타입, 상수, 유틸리티 등 패키지간 코드 재사용
- **인프라**: AWS CDK 기반 IaC (Lambda, DynamoDB, API Gateway, Cognito)
- **문서화(docs)**: 요구사항, 설계, 체크리스트 등 체계적 관리
- **자동화(Git Hooks)**: 프론트엔드 실행 코드(js/ts/tsx) 변경 커밋 시 lint fix, build, test가 자동 수행됨
- **E2E 테스팅**: Playwright를 통한 크로스 브라우저 테스트

## 디렉토리 구조

```text
root/
├── frontend/       # React + Mantine UI 프론트엔드
├── backend/        # Clean Architecture 백엔드 + AWS CDK
├── shared/         # 타입, 상수, 공통 유틸리티
├── docs/           # 프로젝트 문서
├── scripts/        # 유틸리티 스크립트 (GitHub Pages URL 추출 등)
└── global_windsurf_rules.md  # 개발 규칙
```

## 기술 스택

### 프론트엔드

- **프레임워크**: React 19.x + TypeScript 5.7.x
- **빌드 도구**: Vite 6.x
- **UI 라이브러리**: Mantine UI 7.x
- **상태 관리**: React Context API + useReducer
- **테스팅**: Jest 29.x + React Testing Library + Playwright 1.52.x

### 백엔드

- **런타임**: Node.js 22.x + TypeScript 5.8.x
- **아키텍처**: Clean Architecture (Entity → Repository → UseCase → Controller → Handler)
- **인프라**: AWS CDK 2.x (Lambda, DynamoDB, API Gateway, Cognito)
- **테스팅**: Jest 30.x + TDD 방법론

### 공유 모듈

- **타입 정의**: Todo 엔티티 타입, API 인터페이스
- **유틸리티**: Todo 검증 함수, 상수 관리

## 주요 명령어

### 전체 프로젝트

```bash
# 개발 서버 시작
npm run frontend:dev

# 전체 빌드
npm run frontend:build && npm run backend:build && npm run shared:build

# 전체 테스트
npm run frontend:test && npm run backend:test && npm run shared:test

# E2E 테스트
npm run e2e:local      # 로컬 개발 서버 대상
npm run e2e:pages      # GitHub Pages 자동 감지
npm run e2e:headed     # 브라우저 창 표시
npm run e2e:debug      # 스텝별 디버깅

# AWS 인프라
npm run cdk:synth      # CloudFormation 템플릿 생성
npm run cdk:deploy     # AWS 리소스 배포
npm run cdk:destroy    # 리소스 정리
```

### 워크스페이스별 작업

```bash
# 프론트엔드
cd frontend && npm run dev    # 개발 서버
cd frontend && npm test       # 단위 테스트

# 백엔드
cd backend && npm run test:watch     # TDD 모드
cd backend && npm run test:coverage  # 커버리지 확인

# 공유 모듈
cd shared && npm run build && npm test
```

## 개발 가이드

### 프로젝트 구조 이해

- **프론트엔드**: 컴포넌트 기반 React 앱, Mantine UI로 일관된 디자인
- **백엔드**: 도메인 중심 설계, AWS Lambda로 서버리스 구현
- **공유 모듈**: 프론트엔드-백엔드 간 타입 안정성 보장

### 개발 워크플로우

1. **이슈 생성**: GitHub Issue 필수 생성 후 브랜치 작업
2. **브랜치 전략**: `feature/123-description` 형식으로 이슈 번호 포함
3. **커밋 규칙**: `feat:`, `fix:`, `docs:` 등 컨벤셔널 커밋 + 이슈 참조
4. **자동화**: Pre-commit 훅으로 lint, build, test 자동 실행
5. **품질 보증**: 80%+ 테스트 커버리지, TypeScript strict 모드

### 테스트 전략

- **프론트엔드**: 컴포넌트 테스트 + E2E 테스트
- **백엔드**: TDD 방법론으로 도메인 로직 검증
- **통합**: Playwright로 실제 사용자 시나리오 검증

## 문서화

### 필수 문서

- **[CLAUDE.md](./CLAUDE.md)**: Claude Code를 위한 프로젝트 가이드
- **[docs/requirements.md](./docs/requirements.md)**: 기능/비기능 요구사항
- **[docs/design/](./docs/design/)**: 시스템 아키텍처 및 설계 문서
- **[docs/tasks/](./docs/tasks/)**: 단계별 구현 체크리스트

### 워크스페이스별 문서

- **[frontend/README.md](./frontend/README.md)**: 프론트엔드 개발 가이드
- **[backend/README.md](./backend/README.md)**: 백엔드 아키텍처 가이드
- **[shared/README.md](./shared/README.md)**: 공유 모듈 사용법

## 프로젝트 규칙

### 개발 원칙

- **TDD**: 백엔드 비즈니스 로직은 테스트 우선 개발
- **Clean Architecture**: 의존성 규칙 준수, 도메인 중심 설계
- **타입 안정성**: TypeScript strict 모드, 런타임 타입 검증
- **자동화 우선**: 수동 작업 최소화, Git hooks 활용

### 코드 품질

- **ESLint + Prettier**: 일관된 코드 스타일
- **테스트 커버리지**: 핵심 로직 80% 이상 유지
- **커밋 규칙**: 이슈 연동 필수, pre-commit 검증 통과

### 커뮤니케이션

- **한국어 우선**: 문서, 커밋 메시지, 이슈 등 한국어 작성
- **증거 기반**: 이슈 종료 시 실행 결과 스크린샷/로그 첨부
- **문서 동기화**: 코드 변경 시 관련 문서 함께 업데이트

## 시작하기

### 1. 환경 설정

```bash
# Node.js 22+ 설치 확인
node --version  # v22.x.x 이상

# 의존성 설치
npm install

# Git hooks 설정
npm run prepare
```

### 2. 로컬 개발

```bash
# 프론트엔드 개발 서버 시작
npm run frontend:dev

# 새 터미널에서 백엔드 테스트 감시
cd backend && npm run test:watch
```

### 3. 배포 및 인프라

```bash
# CloudFormation 템플릿 생성
npm run cdk:synth

# AWS 리소스 배포 (AWS 자격증명 필요)
npm run cdk:deploy
```

더 자세한 내용은 각 워크스페이스의 README.md와 docs/ 폴더의 문서를 참고하세요.
