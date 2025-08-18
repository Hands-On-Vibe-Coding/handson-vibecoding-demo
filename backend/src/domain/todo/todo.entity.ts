import { randomUUID } from 'crypto';

export interface TodoProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoJSON {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class Todo {
  private readonly props: TodoProps;

  private constructor(props: TodoProps) {
    this.props = props;
  }

  public static create(props: Omit<TodoProps, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    return new Todo({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstruct(props: TodoProps | any): Todo {
    return new Todo({
      ...props,
      createdAt: typeof props.createdAt === 'string' ? new Date(props.createdAt) : props.createdAt,
      updatedAt: typeof props.updatedAt === 'string' ? new Date(props.updatedAt) : props.updatedAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public complete(): void {
    this.props.completed = true;
    this.props.updatedAt = new Date();
  }

  public uncomplete(): void {
    this.props.completed = false;
    this.props.updatedAt = new Date();
  }

  public update(title: string, description?: string): void {
    this.props.title = title;
    if (description !== undefined) {
      this.props.description = description;
    }
    this.props.updatedAt = new Date();
  }

  public toJSON(): TodoJSON {
    return {
      ...this.props,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
