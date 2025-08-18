import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { TodoRepository } from '../../domain/todo/todo.repository';
import { Todo, TodoProps } from '../../domain/todo/todo.entity';

export class TodoRepositoryImpl implements TodoRepository {
  private readonly tableName: string;

  constructor(
    private readonly ddbDocClient: DynamoDBDocumentClient,
    tableName?: string,
  ) {
    this.tableName = tableName || process.env.TODO_TABLE_NAME || '';
    if (!this.tableName) {
      throw new Error(
        'Table name is not configured. Please set TODO_TABLE_NAME environment variable or pass it to the constructor.',
      );
    }
  }

  async save(todo: Todo): Promise<void> {
    const params = new PutCommand({
      TableName: this.tableName,
      Item: todo.toJSON(),
    });
    await this.ddbDocClient.send(params);
  }

  async findById(id: string): Promise<Todo | null> {
    // Composite Key 테이블에서 id만으로 조회하려면 Scan을 사용해야 함
    const params = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
    });
    const { Items } = await this.ddbDocClient.send(params);
    if (!Items || Items.length === 0) {
      return null;
    }
    return Todo.reconstruct(Items[0] as TodoProps);
  }

  async findAll(): Promise<Todo[]> {
    const params = new ScanCommand({
      TableName: this.tableName,
    });
    const { Items } = await this.ddbDocClient.send(params);
    return (Items || []).map((item) => Todo.reconstruct(item as TodoProps));
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    const params = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userId-index', // Assuming a GSI on userId
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    const { Items } = await this.ddbDocClient.send(params);
    return (Items || []).map((item) => Todo.reconstruct(item as TodoProps));
  }

  async delete(id: string): Promise<void> {
    // Composite Key 테이블에서 삭제하려면 먼저 항목을 찾아 userId를 얻어야 함
    const todo = await this.findById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    const params = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        id: id,
        userId: todo.userId,
      },
    });
    await this.ddbDocClient.send(params);
  }
}
