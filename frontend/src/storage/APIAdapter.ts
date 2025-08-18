import { Todo, TodoStatus, TodoPriority } from '@vibecoding-demo/shared/src/types/todo';
import { StorageInterface } from './StorageInterface';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

/**
 * API 어댑터 클래스
 * StorageInterface를 구현하여 백엔드 API와 통신하는 기능을 제공합니다.
 * Cognito unauthenticated 사용자로 인증하여 API를 호출합니다.
 */
export class APIAdapter implements StorageInterface {
  private readonly apiBaseUrl: string;
  private readonly region: string;
  private readonly identityPoolId: string;
  private credentials: any;
  private credentialsPromise: Promise<any> | null = null;

  /**
   * API 어댑터 생성자
   */
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    this.region = import.meta.env.VITE_COGNITO_REGION;
    this.identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;

    if (!this.apiBaseUrl || !this.region || !this.identityPoolId) {
      throw new Error('API 설정이 완전하지 않습니다. 환경 변수를 확인해주세요.');
    }
  }

  /**
   * Cognito unauthenticated 자격 증명을 가져옵니다.
   */
  private async getCredentials() {
    if (this.credentialsPromise) {
      return this.credentialsPromise;
    }

    this.credentialsPromise = fromCognitoIdentityPool({
      // @ts-expect-error - AWS SDK 타입 호환성 문제
      client: new CognitoIdentityClient({ region: this.region }),
      identityPoolId: this.identityPoolId,
    })();

    try {
      this.credentials = await this.credentialsPromise;
      return this.credentials;
    } catch (error) {
      this.credentialsPromise = null;
      throw error;
    }
  }

  /**
   * API 요청을 위한 인증 헤더를 생성합니다.
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const credentials = await this.getCredentials();
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${(credentials as any).accessKeyId}`,
        'X-Amz-Security-Token': (credentials as any).sessionToken || '',
      };
    } catch (error) {
      console.error('인증 헤더 생성 실패:', error);
      // 인증 실패시 기본 헤더 반환
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  /**
   * API 요청을 수행합니다.
   */
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.apiBaseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
      }

      // 빈 응답인 경우 빈 객체 반환
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        console.error('JSON 파싱 실패:', parseError);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
    } catch (error) {
      console.error(`API 요청 오류 (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * 모든 Todo 항목을 가져옵니다.
   */
  async getAll(): Promise<Todo[]> {
    try {
      const response = await this.apiRequest<{ todos: Todo[] }>('/todos');
      
      // 응답이 배열인 경우와 객체인 경우 모두 처리
      const todos = Array.isArray(response) ? response : response.todos || [];
      
      // JSON으로 직렬화되면서 Date 객체가 문자열로 변환되므로, 다시 Date 객체로 변환
      // 백엔드의 completed 필드를 프론트엔드의 status 필드로 변환
      // 백엔드에 priority 필드가 없으므로 기본값 설정
      return todos.map(todo => ({
        ...todo,
        status: (todo as { completed?: boolean; priority?: TodoPriority; userId?: string }).completed ? TodoStatus.COMPLETED : TodoStatus.ACTIVE,
        priority: (todo as { completed?: boolean; priority?: TodoPriority; userId?: string }).priority || TodoPriority.MEDIUM, // 기본값으로 MEDIUM 설정
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }));
    } catch (error) {
      console.error('Todo 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 특정 ID의 Todo 항목을 가져옵니다.
   */
  async getById(id: string): Promise<Todo | null> {
    try {
      const todo = await this.apiRequest<Todo>(`/todos/${id}`);
      
      if (!todo) {
        return null;
      }

      // Date 객체 변환 및 백엔드 데이터 형식 변환
      return {
        ...todo,
        status: (todo as { completed?: boolean; priority?: TodoPriority; userId?: string }).completed ? TodoStatus.COMPLETED : TodoStatus.ACTIVE,
        priority: (todo as { completed?: boolean; priority?: TodoPriority; userId?: string }).priority || TodoPriority.MEDIUM, // 기본값으로 MEDIUM 설정
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      };
    } catch (error) {
      console.error(`Todo 조회 실패 (ID: ${id}):`, error);
      return null;
    }
  }

  /**
   * Todo 항목을 저장합니다.
   */
  async save(todo: Todo): Promise<Todo> {
    try {
      // 새 항목인지 기존 항목인지 확인
      const existingTodo = await this.getById(todo.id);
      const isUpdate = existingTodo !== null;
      

      // 백엔드 API에 맞게 데이터 변환
      const apiTodo = {
        ...todo,
        completed: todo.status === TodoStatus.COMPLETED,
        userId: (todo as { completed?: boolean; priority?: TodoPriority; userId?: string }).userId || 'default-user', // 기본 userId 설정
        // API에는 status, priority 필드를 보내지 않음 (백엔드에서 지원하지 않음)
        status: undefined,
        priority: undefined,
      };

      const savedTodo = await this.apiRequest<Todo>(
        isUpdate ? `/todos/${todo.id}` : '/todos',
        {
          method: isUpdate ? 'PUT' : 'POST',
          body: JSON.stringify(apiTodo),
        }
      );

      // Date 객체 변환 및 백엔드 데이터 형식 변환
      return {
        ...savedTodo,
        status: (savedTodo as { completed?: boolean; priority?: TodoPriority }).completed ? TodoStatus.COMPLETED : TodoStatus.ACTIVE,
        priority: (savedTodo as { completed?: boolean; priority?: TodoPriority }).priority || todo.priority || TodoPriority.MEDIUM, // 기본값으로 MEDIUM 설정
        createdAt: new Date(savedTodo.createdAt),
        updatedAt: new Date(savedTodo.updatedAt)
      };
    } catch (error) {
      console.error('Todo 저장 실패:', error);
      throw error; // 오류를 다시 던져서 상위에서 처리할 수 있도록 함
    }
  }

  /**
   * 여러 Todo 항목을 한 번에 저장합니다.
   * API가 배치 저장을 지원하지 않으므로 개별적으로 저장합니다.
   */
  async saveAll(todos: Todo[]): Promise<Todo[]> {
    try {
      const savedTodos: Todo[] = [];
      
      for (const todo of todos) {
        const savedTodo = await this.save(todo);
        savedTodos.push(savedTodo);
      }
      
      return savedTodos;
    } catch (error) {
      console.error('Todo 일괄 저장 실패:', error);
      return todos; // 오류 발생 시 원본 배열 반환
    }
  }

  /**
   * 특정 ID의 Todo 항목을 삭제합니다.
   */
  async remove(id: string): Promise<boolean> {
    try {
      await this.apiRequest(`/todos/${id}`, {
        method: 'DELETE',
      });
      
      return true;
    } catch (error) {
      console.error(`Todo 삭제 실패 (ID: ${id}):`, error);
      return false;
    }
  }

  /**
   * 모든 Todo 항목을 삭제합니다.
   * API가 일괄 삭제를 지원하지 않으므로 개별적으로 삭제합니다.
   */
  async removeAll(): Promise<boolean> {
    try {
      const todos = await this.getAll();
      
      for (const todo of todos) {
        await this.remove(todo.id);
      }
      
      return true;
    } catch (error) {
      console.error('Todo 전체 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 완료된 Todo 항목만 삭제합니다.
   */
  async removeCompleted(): Promise<boolean> {
    try {
      const todos = await this.getAll();
      const completedTodos = todos.filter(todo => todo.status === TodoStatus.COMPLETED);
      
      for (const todo of completedTodos) {
        await this.remove(todo.id);
      }
      
      return true;
    } catch (error) {
      console.error('완료된 Todo 삭제 실패:', error);
      return false;
    }
  }
}