# Frontend - React TODO App

React 19 + TypeScript + Vite + Mantine UI 기반의 모던 TODO 애플리케이션 프론트엔드입니다.

## 기술 스택

### 핵심 기술
- **React 19.0.x**: 최신 React 기능 활용
- **TypeScript 5.7.x**: 타입 안정성 보장
- **Vite 6.x**: 빠른 개발 서버 및 빌드
- **Mantine UI 7.17.x**: 모던 UI 컴포넌트 라이브러리

### 상태 관리 및 스토리지
- **React Context API + useReducer**: 전역 상태 관리
- **LocalStorage Adapter**: 데이터 저장 (인터페이스 패턴 적용)
- **@vibecoding-demo/shared**: 공유 타입 및 유틸리티

### 테스팅
- **Jest 29.x**: 단위 테스트 프레임워크
- **React Testing Library 16.x**: 컴포넌트 테스트
- **Playwright 1.52.x**: E2E 테스트 (크로스 브라우저)

### 개발 도구
- **ESLint 9.x + Prettier 3.x**: 코드 품질 관리
- **TypeScript ESLint**: TypeScript 전용 린팅
- **Husky**: Git hooks를 통한 자동화

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── Header.tsx
│   │   ├── MantineProvider.tsx
│   │   ├── MobileNavbar.tsx
│   │   ├── TodoFilters.tsx
│   │   ├── TodoInput.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoList.tsx
│   ├── contexts/             # React Context 프로바이더
│   │   └── TodoContext.tsx
│   ├── hooks/                # 커스텀 훅
│   │   └── useTodoHooks.tsx
│   ├── models/               # 도메인 모델
│   │   └── TodoModel.ts
│   ├── storage/              # 스토리지 추상화 계층
│   │   ├── LocalStorageAdapter.ts
│   │   └── StorageInterface.ts
│   ├── __tests__/            # 테스트 파일
│   └── assets/               # 정적 자산
├── e2e/                      # Playwright E2E 테스트
│   ├── todo.spec.ts
│   └── visual.spec.ts
├── public/                   # 정적 파일
└── dist/                     # 빌드 결과물
```

## 주요 명령어

### 개발
```bash
# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 테스팅
```bash
# 단위 테스트 실행
npm test

# E2E 테스트 (여러 옵션)
npm run test:e2e              # 기본 (환경변수 기반)
npm run test:e2e:local        # 로컬 개발 서버 대상
npm run test:e2e:pages        # GitHub Pages 자동 감지
npm run test:e2e:headed       # 브라우저 창 표시
npm run test:e2e:debug        # 스텝별 디버깅
npm run test:e2e:noreport     # HTML 리포트 생성 안함
```

### 코드 품질
```bash
# ESLint 검사 및 자동 수정
npm run lint

# Prettier 포맷팅 (package.json scripts에 없으면 직접 실행)
npx prettier --write src/
```

## 아키텍처 특징

### 컴포넌트 설계
- **단일 책임 원칙**: 각 컴포넌트는 하나의 명확한 역할
- **재사용성**: Mantine UI 기반의 일관된 디자인 시스템
- **접근성**: WCAG 2.1 AA 수준 준수

### 상태 관리
- **Context API**: React의 내장 상태 관리 활용
- **useReducer**: 복잡한 상태 로직을 예측 가능하게 관리
- **Local State**: 컴포넌트별 단순 상태는 useState 사용

### 스토리지 패턴
- **인터페이스 추상화**: `StorageInterface`로 스토리지 구현 분리
- **어댑터 패턴**: `LocalStorageAdapter`로 실제 구현
- **확장성**: 향후 백엔드 API 연동 시 어댑터만 교체

### 테스트 전략
- **컴포넌트 테스트**: React Testing Library로 사용자 관점 테스트
- **E2E 테스트**: Playwright로 실제 브라우저 시나리오 검증
- **시각적 회귀 테스트**: 스크린샷 기반 UI 변경 감지

## E2E 테스트 설정

### 테스트 환경
- **크로스 브라우저**: Chrome, Firefox, Safari, Edge
- **모바일 에뮬레이션**: Mobile Chrome, Mobile Safari
- **시각적 테스트**: 스크린샷 비교로 UI 회귀 감지

### 환경별 실행
```bash
# 로컬 개발 (서버 자동 시작)
npm run test:e2e:local

# GitHub Pages (URL 자동 감지)
npm run test:e2e:pages

# 사용자 정의 URL
PLAYWRIGHT_BASE_URL=https://example.com npm run test:e2e:remote
```

## 개발 가이드

### 새 컴포넌트 추가
1. `src/components/` 디렉토리에 `.tsx` 파일 생성
2. Mantine UI 컴포넌트 활용
3. TypeScript props 인터페이스 정의
4. 테스트 파일 `src/__tests__/` 디렉토리에 추가

### 상태 관리 확장
1. `TodoContext.tsx`에서 리듀서 액션 추가
2. 타입 정의 업데이트
3. 관련 훅 `useTodoHooks.tsx`에서 로직 구현

### 스토리지 어댑터 변경
1. `StorageInterface` 인터페이스 구현
2. `TodoContext`에서 어댑터 교체
3. 기존 데이터 마이그레이션 고려

### 테스트 작성
```typescript
// 컴포넌트 테스트 예시
import { render, screen } from '@testing-library/react';
import { TodoItem } from '../components/TodoItem';

test('displays todo title', () => {
  const todo = { id: '1', title: 'Test Todo', completed: false };
  render(<TodoItem todo={todo} />);
  expect(screen.getByText('Test Todo')).toBeInTheDocument();
});
```

## 성능 최적화

### 번들 최적화
- **코드 분할**: React.lazy()를 통한 동적 임포트
- **트리 쉐이킹**: 사용하지 않는 코드 자동 제거
- **Mantine UI**: 필요한 컴포넌트만 임포트

### 렌더링 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 메모이제이션 활용
- **Context 분할**: 상태 변경 영향 범위 최소화

### 로딩 성능
- **Vite HMR**: 개발 중 빠른 모듈 교체
- **번들 분석**: `vite-bundle-analyzer` 활용 가능
- **이미지 최적화**: 적절한 형식 및 크기 사용

## 배포

### GitHub Pages
```bash
# 빌드 후 dist/ 디렉토리가 자동 배포됨
npm run build
```

### 환경 변수
- 프로덕션 배포 시 필요한 환경 변수는 GitHub Secrets로 관리
- 로컬 개발 시 `.env.local` 파일 사용 (gitignore에 포함됨)

## 문제 해결

### 일반적인 문제
1. **포트 충돌**: 다른 포트 사용 `npm run dev -- --port 3000`
2. **캐시 문제**: `rm -rf node_modules/.cache` 후 재시작
3. **타입 오류**: `npm run build`로 전체 타입 검사

### E2E 테스트 문제
1. **브라우저 설치**: `npx playwright install`
2. **타임아웃**: `playwright.config.ts`에서 timeout 조정
3. **스크린샷 차이**: `--update-snapshots` 플래그로 업데이트

더 자세한 내용은 [프로젝트 문서](../docs/)를 참고하세요.