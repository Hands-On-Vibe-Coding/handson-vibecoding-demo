import { useState } from 'react';
import { TextInput, Button, Group, Box, Select } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { useTodoActions } from '../hooks/useTodoHooks';
import { TodoPriority } from '@vibecoding-demo/shared/src/types/todo';

export function TodoInput() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>(TodoPriority.MEDIUM);
  const { addTodo } = useTodoActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      try {
        await addTodo({
          title: title.trim(),
          priority: priority as TodoPriority
        });
        setTitle('');
        setPriority(TodoPriority.MEDIUM);
      } catch (error) {
        console.error('Todo 추가 실패:', error);
        // 사용자에게 오류 메시지를 표시할 수 있습니다.
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mb="md" style={{ width: '100%' }}>
      <Group align="flex-end" gap="sm" style={{ width: '100%' }}>
        <TextInput
          leftSection={<IconPencil size={16} />}
          placeholder="새 할일 추가"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
          data-testid="todo-input"
        />
        <Select
          placeholder="우선순위"
          value={priority}
          onChange={(value) => setPriority(value || TodoPriority.MEDIUM)}
          data={[
            { value: TodoPriority.HIGH, label: '높음' },
            { value: TodoPriority.MEDIUM, label: '중간' },
            { value: TodoPriority.LOW, label: '낮음' }
          ]}
          style={{ width: '120px' }}
          data-testid="todo-priority-select"
        />
        <Button 
          type="submit" 
          leftSection={<IconPlus size={16} />}
          disabled={!title.trim()}
          data-testid="add-todo-button"
        >
          추가
        </Button>
      </Group>
    </Box>
  );
}
