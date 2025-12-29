'use client'

import { useQuery } from '@tanstack/react-query'
import { taskService } from '@/lib/api-services'
import Link from 'next/link'
import { useState } from 'react'

export default function TasksPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => taskService.getAllTasks(),
  })

  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredTasks = tasks
    ?.filter((task) => {
      if (filter === 'assigned') return task.assignee
      if (filter === 'unassigned') return !task.assignee
      return true
    })
    ?.filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          All Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all tasks across projects
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'assigned' | 'unassigned')}
          >
            <option value="all">All Tasks</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      {filteredTasks && filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Link
              key={task._id}
              href={`/dashboard/tasks/${task._id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {task.title}
                </h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize">
                  {task.status.replace('-', ' ')}
                </span>
              </div>
              {task.project && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Project: {task.project.name}
                </p>
              )}
              {task.assignee && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned to: {task.assignee.name}
                </p>
              )}
              {task.dueDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'No tasks match your search.' : 'No tasks found.'}
          </p>
        </div>
      )}
    </div>
  )
}