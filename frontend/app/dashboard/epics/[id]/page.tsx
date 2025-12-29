'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  epicService,
  userStoryService,
  taskService,
  Epic,
  UserStory,
  Task,
  projectService,
} from '@/lib/api-services'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

export default function EpicDetailPage() {
  const params = useParams()
  const epicId = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Epic>>({})

  const { data: epic, isLoading: epicLoading } = useQuery({
    queryKey: ['epic', epicId],
    queryFn: () => epicService.getById(epicId),
  })

  const { data: project } = useQuery({
    queryKey: ['project', epic?.project._id],
    queryFn: () => projectService.getById(epic!.project._id),
    enabled: !!epic?.project._id,
  })

  const { data: userStories, isLoading: userStoriesLoading } = useQuery({
    queryKey: ['epic-user-stories', epicId],
    queryFn: () => epicService.getUserStories(epicId),
    enabled: !!epicId,
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['epic-tasks', epicId],
    queryFn: () => epicService.getTasks(epicId),
    enabled: !!epicId,
  })

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Epic>) => epicService.update(epicId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epic', epicId] })
      queryClient.invalidateQueries({ queryKey: ['epics'] })
      toast.success('Epic updated!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update epic')
    },
  })

  const handleEdit = () => {
    if (epic) {
      setEditData({
        name: epic.name,
        description: epic.description,
        status: epic.status,
        priority: epic.priority,
        assignee: epic.assignee,
        startDate: epic.startDate,
        dueDate: epic.dueDate,
        labels: epic.labels,
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  if (epicLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!epic) {
    return (
      <div className="p-8">
        <p className="text-gray-600 dark:text-gray-400">Epic not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${epic.project._id}`}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← Back to Project
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary-500 mb-2"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {epic.name}
              </h1>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {epic.project.key}-EPIC-{epic._id.slice(-4)}
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={editData.status}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    status: e.target.value as Epic['status'],
                  })
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {epic.status.replace('-', ' ')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={editData.priority}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    priority: e.target.value as Epic['priority'],
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {epic.priority}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reporter
            </label>
            <p className="text-gray-900 dark:text-white">
              {epic.reporter.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <p className="text-gray-900 dark:text-white">
              {epic.assignee ? epic.assignee.name : 'Unassigned'}
            </p>
          </div>
          {epic.startDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(epic.startDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {epic.dueDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(epic.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
              value={editData.description || ''}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {epic.description || 'No description'}
            </p>
          )}
        </div>

        {epic.labels && epic.labels.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {epic.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Stories
          </h2>
          {userStoriesLoading ? (
            <p className="text-gray-500">Loading user stories...</p>
          ) : userStories && userStories.length > 0 ? (
            <div className="space-y-3">
              {userStories.map((userStory) => (
                <Link
                  key={userStory._id}
                  href={`/dashboard/user-stories/${userStory._id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {userStory.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {userStory.project.key}-US-{userStory._id.slice(-4)} •{' '}
                        {userStory.status.replace('-', ' ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userStory.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No user stories linked to this epic yet
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tasks
          </h2>
          {tasksLoading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link
                  key={task._id}
                  href={`/dashboard/tasks/${task._id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.project.key}-{task._id.slice(-4)} •{' '}
                        {task.status.replace('-', ' ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {task.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No tasks linked to this epic yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}