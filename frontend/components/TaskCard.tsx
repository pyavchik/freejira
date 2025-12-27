'use client'

import { Task } from '@/lib/api-services'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => void
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const assigneeInitial = task.assignee?.name?.charAt(0).toUpperCase() || ''

  return (
    <Link href={`/dashboard/tasks/${task._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mr-2">
            {task.title}
          </h3>
          <span
            className={cn(
              'text-xs px-2 py-1 rounded',
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalSubtasks > 0 && (
              <span>
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {task.project.key}
            </div>
            <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-medium flex items-center justify-center" title={task.assignee ? task.assignee.name : 'Unassigned'}>
              {task.assignee ? assigneeInitial : '?'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
