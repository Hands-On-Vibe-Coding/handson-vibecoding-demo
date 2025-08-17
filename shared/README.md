# Shared - 공통 모듈

프론트엔드와 백엔드에서 공통으로 사용하는 타입, 상수, 유틸리티를 관리하는 공유 모듈입니다.

## 목적

- **타입 안정성**: 프론트엔드-백엔드 간 일관된 타입 정의
- **코드 재사용**: 공통 로직 및 유틸리티 함수 공유
- **일관성**: 상수 및 설정 값 통일 관리
- **유지보수성**: 변경 사항을 한 곳에서 관리

## 기술 스택

- **TypeScript 5.3.x**: 타입 안정성 보장
- **Jest 29.x**: 단위 테스트
- **ESLint**: 코드 품질 관리
- **Node.js 22+**: 최신 런타임 환경

## 프로젝트 구조

```
shared/
├── src/
│   ├── types/                    # TypeScript 타입 정의
│   │   ├── index.ts              # 타입 exports
│   │   └── todo.ts               # Todo 관련 타입
│   ├── constants/                # 상수 정의
│   │   ├── index.ts              # 상수 exports
│   │   └── todo.ts               # Todo 관련 상수
│   ├── utils/                    # 유틸리티 함수
│   │   ├── index.ts              # 유틸리티 exports
│   │   ├── todoUtils.ts          # Todo 관련 유틸리티
│   │   └── todoUtils.test.ts     # 유틸리티 테스트
│   └── index.ts                  # 메인 export 파일
├── dist/                         # 컴파일된 JavaScript 출력
└── package.json                  # 패키지 설정
```

## 주요 명령어

### 개발
```bash
# TypeScript 컴파일
npm run build

# 테스트 실행
npm test

# 코드 검사
npm run lint

# 코드 자동 수정
npm run lint:fix
```

## 주요 exports

### 타입 정의
```typescript
// Todo 관련 타입
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TodoStatus = 'pending' | 'completed';

// 필터링 타입
export type TodoFilter = 'all' | 'active' | 'completed';

// 정렬 타입
export type TodoSort = 'createdAt' | 'priority' | 'title';
```

### 상수 정의
```typescript
// Todo 우선순위 상수
export const TODO_PRIORITY = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const,
} as const;

// Todo 상태 상수
export const TODO_STATUS = {
  PENDING: 'pending' as const,
  COMPLETED: 'completed' as const,
} as const;

// 기본값
export const TODO_DEFAULTS = {
  PRIORITY: TODO_PRIORITY.MEDIUM,
  FILTER: 'all' as TodoFilter,
  SORT: 'createdAt' as TodoSort,
} as const;
```

### 유틸리티 함수
```typescript
// Todo 검증 함수
export function validateTodoTitle(title: string): boolean;
export function validateTodoPriority(priority: string): priority is TodoPriority;

// Todo 필터링 함수
export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[];
export function sortTodos(todos: Todo[], sort: TodoSort): Todo[];

// Todo 변환 함수
export function serializeTodo(todo: Todo): string;
export function deserializeTodo(data: string): Todo;
```

## 사용법

### 프론트엔드에서 사용
```typescript
// React 컴포넌트에서
import { Todo, TodoPriority, TODO_PRIORITY, validateTodoTitle } from '@vibecoding-demo/shared';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate }) => {
  const handlePriorityChange = (priority: TodoPriority) => {
    const updatedTodo = { ...todo, priority, updatedAt: new Date() };
    onUpdate(updatedTodo);
  };

  return (
    <div>
      <h3>{todo.title}</h3>
      <select value={todo.priority} onChange={e => handlePriorityChange(e.target.value as TodoPriority)}>
        <option value={TODO_PRIORITY.LOW}>낮음</option>
        <option value={TODO_PRIORITY.MEDIUM}>보통</option>
        <option value={TODO_PRIORITY.HIGH}>높음</option>
      </select>
    </div>
  );
};
```

### 백엔드에서 사용
```typescript
// Clean Architecture 엔티티에서
import { Todo, TodoPriority, validateTodoTitle } from '@vibecoding-demo/shared';

export class TodoEntity {
  constructor(private todo: Todo) {}

  static create(title: string, priority: TodoPriority, userId: string): TodoEntity {
    if (!validateTodoTitle(title)) {
      throw new Error('Invalid todo title');
    }

    const todo: Todo = {
      id: generateId(),
      title,
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new TodoEntity(todo);
  }

  complete(): TodoEntity {
    const completedTodo = {
      ...this.todo,
      completed: true,
      updatedAt: new Date(),
    };
    
    return new TodoEntity(completedTodo);
  }
}
```

## 패키지 종속성

### 프론트엔드 통합
```json
// frontend/package.json
{
  "dependencies": {
    "@vibecoding-demo/shared": "file:../shared"
  }
}
```

### 백엔드 통합
```json
// backend/package.json  
{
  "dependencies": {
    "@vibecoding-demo/shared": "file:../shared"
  }
}
```

## 개발 가이드

### 새 타입 추가
1. `src/types/` 디렉토리에 타입 정의 파일 생성
2. `src/types/index.ts`에서 export 추가
3. 필요시 관련 상수 및 유틸리티 함수 추가
4. 테스트 작성

### 새 유틸리티 함수 추가
1. `src/utils/` 디렉토리에 함수 구현
2. 함께 테스트 파일 작성 (`.test.ts`)
3. `src/utils/index.ts`에서 export 추가
4. 문서화 주석 추가

### 상수 관리
- 하드코딩된 값 방지
- `as const` 어서션으로 타입 안정성 확보
- 의미 있는 네이밍 사용
- 관련 상수들은 객체로 그룹화

## 버전 관리

### 시맨틱 버저닝
- **Major (x.0.0)**: 호환성이 깨지는 변경
- **Minor (x.y.0)**: 기능 추가 (하위 호환)
- **Patch (x.y.z)**: 버그 수정

### 변경 사항 전파
1. shared 모듈 변경
2. `npm run build`로 컴파일
3. 종속 패키지에서 `npm install` 재실행
4. 타입 체크 및 테스트 통과 확인

## 테스트 전략

### 유틸리티 함수 테스트
```typescript
// todoUtils.test.ts
import { validateTodoTitle, filterTodos } from './todoUtils';

describe('validateTodoTitle', () => {
  test('should return true for valid title', () => {
    expect(validateTodoTitle('Valid Title')).toBe(true);
  });

  test('should return false for empty title', () => {
    expect(validateTodoTitle('')).toBe(false);
  });

  test('should return false for title too long', () => {
    const longTitle = 'a'.repeat(501);
    expect(validateTodoTitle(longTitle)).toBe(false);
  });
});

describe('filterTodos', () => {
  const mockTodos = [
    { id: '1', title: 'Todo 1', completed: false },
    { id: '2', title: 'Todo 2', completed: true },
  ];

  test('should filter active todos', () => {
    const result = filterTodos(mockTodos, 'active');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(false);
  });
});
```

## 성능 고려사항

### 번들 크기 최적화
- Tree shaking을 위한 named exports 사용
- 큰 의존성 라이브러리 사용 지양
- 필요한 함수만 import하도록 권장

### 타입 체크 성능
- 복잡한 타입 연산 최소화
- 유니언 타입보다 명시적 타입 선호
- 제네릭 타입의 적절한 사용

## 문제 해결

### 일반적인 문제
1. **타입 오류**: `npm run build`로 컴파일 확인
2. **import 오류**: 경로 및 export 확인
3. **캐시 문제**: `rm -rf dist && npm run build`

### 모노레포 관련 문제
1. **패키지 연결**: `npm install` 후 재시작
2. **버전 불일치**: package.json 버전 확인
3. **순환 의존성**: 의존성 구조 검토

더 자세한 내용은 [프로젝트 문서](../docs/)를 참고하세요.