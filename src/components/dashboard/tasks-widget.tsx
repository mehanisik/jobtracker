import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import TaskForm from '@/components/forms/task-form';
import { useAuthStore } from '@/store/auth';
import type { Task } from '@/types/db-tables';

interface GroupedTasks {
  pending: Task[];
  inProgress: Task[];
  completed: Task[];
}

interface TasksWidgetProps {
  tasks: Task[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void; // Updated Omit
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string) => void;
}

export default function TasksWidget({
  tasks,
  isOpen,
  onOpenChange,
  onAddTask,
  onDeleteTask,
  onToggleTask,
}: TasksWidgetProps) {
  const { user } = useAuthStore();

  const groupedTasks = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === 'pending'),
      inProgress: tasks.filter((t) => t.status === 'in progress'),
      completed: tasks.filter((t) => t.status === 'completed'),
    } as GroupedTasks;
  }, [tasks]);

  const renderTaskList = (tasks: Task[], isCompleted = false) => (
    <div className='space-y-2'>
      {tasks.map((task) => (
        <div key={task.id} className='flex items-center gap-2'>
          <input
            type='checkbox'
            id={`task-${task.id}`}
            className='accent-primary'
            checked={isCompleted}
            onChange={() => {
              onToggleTask?.(task.id);
            }}
            readOnly={isCompleted}
          />
          <label
            htmlFor={`task-${task.id}`}
            className={`text-sm leading-none font-medium ${
              isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
            } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
          >
            {task.task_name || task.title}
          </label>
          {onDeleteTask && (
            <button
              type='button'
              onClick={() => {
                onDeleteTask(task.id);
              }}
              className='text-muted-foreground hover:text-destructive ml-auto'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className='border-border overflow-hidden rounded-lg border bg-card'>
      <div className='p-4'>
        <div className='space-y-4'>
          {groupedTasks.pending.length > 0 && (
            <div>
              <h4 className='text-muted-foreground mb-2 text-sm font-medium'>Pending</h4>
              {renderTaskList(groupedTasks.pending)}
            </div>
          )}

          {groupedTasks.inProgress.length > 0 && (
            <div>
              <h4 className='text-muted-foreground mb-2 text-sm font-medium'>In Progress</h4>
              {renderTaskList(groupedTasks.inProgress)}
            </div>
          )}

          {groupedTasks.completed.length > 0 && (
            <div>
              <h4 className='text-muted-foreground mb-2 text-sm font-medium'>Completed</h4>
              {renderTaskList(groupedTasks.completed, true)}
            </div>
          )}

          {tasks.length === 0 && (
            <div className='text-muted-foreground text-center'>
              No tasks yet. Add your first task to get started.
            </div>
          )}
          {isOpen && (
            <TaskForm
              userId={user?.uid}
              onSubmit={(task) => {
                onAddTask?.(task);
                onOpenChange(false);
              }}
              onCancel={() => {
                onOpenChange(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
