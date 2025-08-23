import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TodoController } from '../../interfaces/rest/todo.controller';
import { TodoUseCaseImpl } from '../../application/todo/todo.usecase.impl';
import { TodoRepositoryImpl } from '../../infrastructure/dynamodb/todo.repository.impl';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const todoRepository = new TodoRepositoryImpl(ddbDocClient);
const todoUseCase = new TodoUseCaseImpl(todoRepository);
const todoController = new TodoController(todoUseCase);

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context,
  _callback: any,
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;

  // Router using regex
  if (httpMethod === 'POST' && path === '/todos') {
    return todoController.create(event);
  }

  if (httpMethod === 'GET' && path === '/todos') {
    return todoController.getAll(event);
  }

  const getByIdMatch = path.match(/^\/todos\/([^/]+)$/);
  if (httpMethod === 'GET' && getByIdMatch) {
    return todoController.getById(event);
  }

  const getByUserIdMatch = path.match(/^\/users\/([^/]+)\/todos$/);
  if (httpMethod === 'GET' && getByUserIdMatch) {
    return todoController.getByUserId(event);
  }

  const updateMatch = path.match(/^\/todos\/([^/]+)$/);
  if (httpMethod === 'PUT' && updateMatch) {
    return todoController.update(event);
  }

  const deleteMatch = path.match(/^\/todos\/([^/]+)$/);
  if (httpMethod === 'DELETE' && deleteMatch) {
    return todoController.delete(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not Found' }),
  };
};
