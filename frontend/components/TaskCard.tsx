import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Task } from '@/lib/api-services'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const assigneeInitial = task.assignee?.name?.charAt(0).toUpperCase() || ''

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <Link href={`/dashboard/tasks/${task._id}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mr-2 hover:underline">
            {task.title}
          </h3>
        </Link>
        <div className="flex items-center space-x-2">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded',
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Task options">
                            <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                          </Menu.Button>
                        </div>            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onEdit(task)
                        }}
                        className={cn(
                          active
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200',
                          'flex px-4 py-2 text-sm w-full text-left'
                        )}
                      >
                        <PencilIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onDelete(task._id)
                        }}
                        className={cn(
                          active
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200',
                          'flex px-4 py-2 text-sm w-full text-left'
                        )}
                      >
                        <TrashIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
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
  )
}
