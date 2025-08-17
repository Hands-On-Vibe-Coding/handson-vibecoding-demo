# Backend - Clean Architecture TODO API

Node.js 22 + TypeScript + AWS 서버리스 기반의 TODO 애플리케이션 백엔드입니다.

## 기술 스택

### 핵심 기술
- **Node.js 22.x**: 최신 런타임 환경
- **TypeScript 5.8.x**: 타입 안정성 및 개발 생산성
- **AWS CDK 2.x**: Infrastructure as Code
- **AWS Lambda**: 서버리스 컴퓨팅

### AWS 서비스
- **API Gateway**: REST API 엔드포인트
- **Lambda**: 서버리스 함수 실행
- **DynamoDB**: NoSQL 데이터베이스
- **Cognito**: 인증 및 사용자 관리
- **CloudWatch**: 로깅 및 모니터링

### 개발 방법론
- **Clean Architecture**: 도메인 중심 설계
- **TDD**: 테스트 주도 개발
- **Domain-Driven Design**: 비즈니스 로직 중심
- **SOLID 원칙**: 객체지향 설계 원칙

### 테스팅 및 품질
- **Jest 30.x**: 테스트 프레임워크
- **ESLint 9.x + Prettier 3.x**: 코드 품질 관리
- **80%+ 커버리지**: 핵심 비즈니스 로직 검증

## 아키텍처 구조

### Clean Architecture 계층
```
backend/
├── src/
│   ├── domain/                    # 도메인 계층 (핵심 비즈니스 로직)
│   │   ├── todo/
│   │   │   ├── todo.entity.ts     # Todo 엔티티
│   │   │   ├── todo.repository.ts # Repository 인터페이스
│   │   │   └── todo.usecase.ts    # UseCase 인터페이스
│   │   └── user/
│   │       ├── user.entity.ts     # User 엔티티
│   │       ├── user.repository.ts # Repository 인터페이스
│   │       ├── user.usecase.ts    # UseCase 인터페이스
│   │       └── auth.repository.ts # Auth Repository 인터페이스
│   ├── application/               # 애플리케이션 계층 (유스케이스 구현)
│   │   ├── todo/
│   │   │   └── todo.usecase.impl.ts
│   │   └── user/
│   │       └── user.usecase.impl.ts
│   ├── infrastructure/            # 인프라스트럭처 계층 (외부 서비스 연동)
│   │   ├── dynamodb/
│   │   │   ├── todo.repository.impl.ts
│   │   │   └── user.repository.impl.ts
│   │   └── cognito/
│   │       └── auth.repository.impl.ts
│   ├── interfaces/                # 인터페이스 계층 (API 컨트롤러)
│   │   └── rest/
│   │       ├── todo.controller.ts
│   │       └── user.controller.ts
│   ├── lambda/                    # Lambda 함수 엔트리 포인트
│   │   ├── todo/
│   │   │   └── index.ts
│   │   └── user/
│   │       └── index.ts
│   └── main/                      # 애플리케이션 조립
│       └── todo.handler.ts
├── lib/                           # CDK 인프라 스택
│   ├── api/
│   │   └── api-stack.ts           # API Gateway 스택
│   ├── auth/
│   │   └── auth-stack.ts          # Cognito 스택
│   ├── database/
│   │   └── database-stack.ts      # DynamoDB 스택
│   ├── lambda/
│   │   └── lambda-stack.ts        # Lambda 함수 스택
│   └── monitoring-stack.ts        # CloudWatch Dashboard 스택
└── test/                          # 테스트 (src 구조 미러링)
    ├── domain/
    ├── application/
    ├── infrastructure/
    ├── interfaces/
    ├── lambda/
    └── main/
```

### 의존성 규칙
- **도메인 계층**: 다른 계층에 의존하지 않음 (순수 비즈니스 로직)
- **애플리케이션 계층**: 도메인 계층에만 의존
- **인프라스트럭처 계층**: 도메인 인터페이스 구현
- **인터페이스 계층**: 애플리케이션 계층 사용

## 주요 명령어

### 개발
```bash
# TypeScript 컴파일
npm run build

# 빌드 전 정리
npm run clean

# 코드 포맷팅
npm run format
```

### 테스팅
```bash
# 전체 테스트 실행
npm test

# 테스트 감시 모드 (TDD 개발)
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

### 코드 품질
```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix
```

### AWS CDK (인프라)
```bash
# CloudFormation 템플릿 생성
npm run cdk:synth

# AWS 리소스 배포
npm run cdk:deploy

# 리소스 삭제
npm run cdk:destroy

# CDK 명령어 직접 실행
npm run cdk -- <command>
```

## 도메인 모델

### Todo Entity
```typescript
export class Todo {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly completed: boolean,
    public readonly priority: TodoPriority,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // 팩토리 메서드
  static create(title: string, priority: TodoPriority, userId: string): Todo
  
  // 비즈니스 로직
  complete(): Todo
  updateTitle(title: string): Todo
  changePriority(priority: TodoPriority): Todo
}
```

### User Entity
```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date
  ) {}

  static create(email: string, name: string): User
}
```

## API 설계

### REST 엔드포인트
```typescript
// Todo API
GET    /api/todos          # 사용자의 모든 Todo 조회
POST   /api/todos          # 새 Todo 생성
GET    /api/todos/{id}     # 특정 Todo 조회
PUT    /api/todos/{id}     # Todo 수정
DELETE /api/todos/{id}     # Todo 삭제

// User API
GET    /api/users/me       # 현재 사용자 정보 조회
PUT    /api/users/me       # 사용자 정보 수정
```

### 요청/응답 형식
```typescript
// Todo 생성 요청
POST /api/todos
{
  "title": "새로운 할일",
  "priority": "HIGH"
}

// Todo 응답
{
  "id": "todo-123",
  "title": "새로운 할일",
  "completed": false,
  "priority": "HIGH",
  "userId": "user-456",
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

## 테스트 전략

### TDD 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소 코드 작성
3. **Refactor**: 코드 개선 및 리팩토링

### 테스트 레벨
```typescript
// 1. 도메인 엔티티 테스트
describe('Todo Entity', () => {
  test('should create new todo', () => {
    const todo = Todo.create('Test Task', 'HIGH', 'user-1');
    expect(todo.title).toBe('Test Task');
    expect(todo.completed).toBe(false);
  });
});

// 2. 유스케이스 테스트
describe('CreateTodoUseCase', () => {
  test('should create todo successfully', async () => {
    const usecase = new CreateTodoUseCaseImpl(mockTodoRepository);
    const result = await usecase.execute(request);
    expect(result.isSuccess()).toBe(true);
  });
});

// 3. 인프라 테스트
describe('DynamoDBTodoRepository', () => {
  test('should save todo to database', async () => {
    const repository = new DynamoDBTodoRepositoryImpl(mockDynamoDB);
    await repository.save(todo);
    // DynamoDB 호출 검증
  });
});
```

### 커버리지 목표
- **Statements**: 80% 이상
- **Branches**: 80% 이상  
- **Functions**: 80% 이상
- **Lines**: 80% 이상

## 개발 가이드

### 새 기능 추가 (TDD 방식)
1. **도메인 모델링**: 비즈니스 요구사항을 엔티티로 설계
2. **테스트 작성**: 실패하는 테스트부터 작성
3. **인터페이스 정의**: Repository, UseCase 인터페이스 정의
4. **구현**: 각 계층별 구현 (Domain → Application → Infrastructure → Interface)
5. **테스트 검증**: 모든 테스트 통과 확인

### 코드 규칙
- **네이밍**: PascalCase (클래스), camelCase (변수/함수)
- **파일명**: kebab-case (예: `todo.entity.ts`)
- **인터페이스**: 도메인 계층에서 정의, 구현은 인프라 계층
- **에러 처리**: Result 패턴 또는 예외 처리 일관성 유지

### 데이터베이스 설계 (DynamoDB)
```typescript
// 단일 테이블 설계
Table: TodoApp
├── PK (Partition Key): USER#<userId> | TODO#<todoId>
├── SK (Sort Key): PROFILE | TODO#<todoId> | USER#<userId>
├── GSI1PK: TODO#<todoId>
├── GSI1SK: USER#<userId>
└── Type: USER | TODO
```

## 배포 및 운영

### 환경별 배포
- **개발**: `cdk deploy --profile dev`
- **스테이징**: `cdk deploy --profile staging`
- **운영**: `cdk deploy --profile prod`

### 모니터링

#### CloudWatch Dashboard (MonitoringStack)
AWS CDK로 구현된 통합 모니터링 대시보드를 제공합니다.

**모니터링 대상**:
- **Lambda Functions**: 호출 횟수, 오류율, 실행 시간, 동시 실행 수, 스로틀링, 성공률
- **API Gateway**: 요청 수, 응답 시간 (평균/최소/최대/P99), HTTP 상태 코드, 캐시 통계
- **DynamoDB**: 읽기/쓰기 용량, 스로틀링, 시스템/사용자 오류, 작업별 응답 시간
- **통합 시스템 상태**: 전체 시스템 오류 현황 및 상태 요약

**대시보드 배포**:
```bash
# MonitoringStack 배포
npx cdk deploy TodoAppMonitoringStack

# 모든 스택 한번에 배포
npx cdk deploy --all
```

**대시보드 접근**:
1. AWS Console → CloudWatch → Dashboards
2. "TodoAppDashboard" 선택

**추가 모니터링 도구**:
- **CloudWatch Logs**: Lambda 함수 로그
- **CloudWatch Metrics**: 실시간 메트릭 조회
- **X-Ray**: 분산 트레이싱 (옵션)

### 보안
- **IAM 역할**: 최소 권한 원칙
- **API Gateway**: 인증 필수
- **Lambda**: VPC 설정 (필요시)
- **DynamoDB**: 암호화 활성화

## 성능 최적화

### Lambda 최적화
- **메모리**: 128MB ~ 1024MB (사용량에 따라 조정)
- **타임아웃**: 30초 (API Gateway 제한)
- **콜드 스타트**: 최소화를 위한 번들 크기 관리

### DynamoDB 최적화
- **파티션 키**: 고른 분산을 위한 설계
- **정렬 키**: 쿼리 패턴 최적화
- **GSI**: 다양한 쿼리 패턴 지원
- **배치 작업**: BatchGet/BatchWrite 활용

## 문제 해결

### 일반적인 문제
1. **CDK 배포 실패**: AWS 자격증명 확인
2. **Lambda 타임아웃**: 메모리 및 타임아웃 설정 조정
3. **DynamoDB 접근 오류**: IAM 권한 확인
4. **테스트 실패**: Mock 설정 및 의존성 주입 확인

### 로그 확인
```bash
# CloudWatch 로그 확인
aws logs describe-log-groups
aws logs get-log-events --log-group-name /aws/lambda/function-name

# CDK 로그
cdk synth --verbose
```

더 자세한 내용은 [프로젝트 문서](../docs/)를 참고하세요.