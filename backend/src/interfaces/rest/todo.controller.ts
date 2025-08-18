import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TodoUseCase } from '../../domain/todo/todo.usecase';
import { CreateTodoInput } from '../../domain/todo/todo.usecase';

export class TodoController {
  constructor(private readonly todoUseCase: TodoUseCase) {}

  /**
   * CORS 헤더를 포함한 API 응답을 생성합니다.
   */
  private createResponse(statusCode: number, body: string): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Content-Type': 'application/json',
      },
      body,
    };
  }

  async create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!event.body) {
      return this.createResponse(400, JSON.stringify({ message: 'Request body is missing' }));
    }

    try {
      const { title, userId, description } = JSON.parse(event.body);
      const createTodoInput: CreateTodoInput = { title, userId, description };
      const todo = await this.todoUseCase.createTodo(createTodoInput);
      return this.createResponse(201, JSON.stringify(todo.toJSON()));
    } catch (error) {
      // Basic error handling, can be improved with a proper error middleware
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error creating todo', error: errorMessage }),
      );
    }
  }

  async getAll(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const todos = await this.todoUseCase.getAllTodos();
      return this.createResponse(200, JSON.stringify(todos.map((t) => t.toJSON())));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error fetching todos', error: errorMessage }),
      );
    }
  }

  async getById(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id) {
      return this.createResponse(400, JSON.stringify({ message: 'Todo ID is missing' }));
    }

    try {
      const todo = await this.todoUseCase.getTodo(id);
      if (!todo) {
        return this.createResponse(404, JSON.stringify({ message: 'Todo not found' }));
      }
      return this.createResponse(200, JSON.stringify(todo.toJSON()));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error fetching todo', error: errorMessage }),
      );
    }
  }

  async getByUserId(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return this.createResponse(400, JSON.stringify({ message: 'User ID is missing' }));
    }

    try {
      const todos = await this.todoUseCase.getUserTodos(userId);
      return this.createResponse(200, JSON.stringify(todos.map((t) => t.toJSON())));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error fetching todos for user', error: errorMessage }),
      );
    }
  }

  async update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id || !event.body) {
      return this.createResponse(400, JSON.stringify({ message: 'Todo ID or body is missing' }));
    }

    try {
      const { title, description, completed } = JSON.parse(event.body);
      const updatedTodo = await this.todoUseCase.updateTodo({ id, title, description, completed });
      return this.createResponse(200, JSON.stringify(updatedTodo.toJSON()));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error updating todo', error: errorMessage }),
      );
    }
  }

  async delete(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id;
    if (!id) {
      return this.createResponse(400, JSON.stringify({ message: 'Todo ID is missing' }));
    }

    try {
      await this.todoUseCase.deleteTodo(id);
      return this.createResponse(204, '');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return this.createResponse(
        500,
        JSON.stringify({ message: 'Error deleting todo', error: errorMessage }),
      );
    }
  }
}
