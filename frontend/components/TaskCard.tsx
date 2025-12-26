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

  return (
    <Link href={`/dashboard/tasks/${task._id}`}>
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {task.title}
          </h3>
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded',
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {completedSubtasks}/{totalSubtasks} subtasks
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {task.assignee ? (
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Unassigned</span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {task.project.key}-{task._id.slice(-4)}
          </span>
        </div>
      </div>
    </Link>
  )
}

