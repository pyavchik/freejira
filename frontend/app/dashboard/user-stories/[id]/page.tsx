'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userStoryService,
  taskService,
  UserStory,
  Task,
} from '@/lib/api-services'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

export default function UserStoryDetailPage() {
  const params = useParams()
  const userStoryId = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<{
    title?: string
    description?: string
    status?: UserStory['status']
    priority?: UserStory['priority']
    storyPoints?: number
    acceptanceCriteria?: Array<{ description: string; completed: boolean }>
    epic?: string
  }>({})

  const { data: userStory, isLoading: userStoryLoading } = useQuery({
    queryKey: ['user-story', userStoryId],
    queryFn: () => userStoryService.getById(userStoryId),
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['user-story-tasks', userStoryId],
    queryFn: () => userStoryService.getTasks(userStoryId),
    enabled: !!userStoryId,
  })

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => userStoryService.delete(userStoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stories'] })
      toast.success('User Story deleted successfully!')
      // Redirect to project page after deletion
      window.location.href = `/dashboard/projects/${userStory?.project._id}`
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user story')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (updates: {
      title?: string
      description?: string
      status?: string
      priority?: string
      storyPoints?: number
      acceptanceCriteria?: Array<{ description: string; completed: boolean }>
    }) => userStoryService.update(userStoryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-story', userStoryId] })
      queryClient.invalidateQueries({ queryKey: ['user-stories'] })
      toast.success('User Story updated!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user story')
    },
  })

  const handleEdit = () => {
    if (userStory) {
      setEditData({
        title: userStory.title,
        description: userStory.description,
        status: userStory.status,
        priority: userStory.priority,
        storyPoints: userStory.storyPoints,
        acceptanceCriteria: userStory.acceptanceCriteria,
        // Don't include assignee - it's an object, not a string ID
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    // Filter out empty acceptance criteria before sending
    const cleanedData = {
      title: editData.title,
      description: editData.description,
      status: editData.status,
      priority: editData.priority,
      storyPoints: editData.storyPoints,
      acceptanceCriteria: editData.acceptanceCriteria?.filter(
        (criteria) => criteria.description.trim() !== ''
      ),
    }
    updateMutation.mutate(cleanedData)
  }

  const handleAcceptanceCriteriaToggle = (index: number) => {
    if (!editData.acceptanceCriteria) return
    const updated = [...editData.acceptanceCriteria]
    updated[index].completed = !updated[index].completed
    setEditData({ ...editData, acceptanceCriteria: updated })
  }

  const handleAddAcceptanceCriteria = () => {
    const newCriteria = {
      description: '',
      completed: false,
    }
    setEditData({
      ...editData,
      acceptanceCriteria: [
        ...(editData.acceptanceCriteria || []),
        newCriteria,
      ],
    })
  }

  const handleAcceptanceCriteriaKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Always add a new criteria when Enter is pressed
      handleAddAcceptanceCriteria()
    }
  }

  if (userStoryLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!userStory) {
    return (
      <div className="p-8">
        <p className="text-gray-600 dark:text-gray-400">User Story not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${userStory.project._id}`}
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
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userStory.title}
              </h1>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userStory.project.key}-US-{userStory._id.slice(-4)}
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
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user story? This action cannot be undone.')) {
                      deleteMutation.mutate()
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
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
                    status: e.target.value as UserStory['status'],
                  })
                }
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {userStory.status.replace('-', ' ')}
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
                    priority: e.target.value as UserStory['priority'],
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {userStory.priority}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Epic
            </label>
            <button
              onClick={() => {
                setIsEditing(true)
                setEditData({ ...editData, epic: userStory.epic?._id })
              }}
              className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
            >
              {userStory.epic ? userStory.epic.name : '🔗 Link to Epic'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reporter
            </label>
            <p className="text-gray-900 dark:text-white">
              {userStory.reporter.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <p className="text-gray-900 dark:text-white">
              {userStory.assignee ? userStory.assignee.name : 'Unassigned'}
            </p>
          </div>
          {userStory.storyPoints > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Story Points
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editData.storyPoints || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      storyPoints: parseInt(e.target.value) || 0,
                    })
                  }
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {userStory.storyPoints}
                </p>
              )}
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
              {userStory.description || 'No description'}
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Acceptance Criteria
            </label>
            {isEditing && (
              <button
                onClick={handleAddAcceptanceCriteria}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Criteria
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {editData.acceptanceCriteria?.map((criteria, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={criteria.completed}
                    onChange={() => handleAcceptanceCriteriaToggle(index)}
                    className="rounded"
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={criteria.description}
                    onChange={(e) => {
                      const updated = [...(editData.acceptanceCriteria || [])]
                      updated[index].description = e.target.value
                      setEditData({ ...editData, acceptanceCriteria: updated })
                    }}
                    onKeyDown={(e) => handleAcceptanceCriteriaKeyDown(e, index)}
                    placeholder="Enter acceptance criteria"
                  />
                </div>
              ))}
            </div>
          ) : userStory.acceptanceCriteria &&
            userStory.acceptanceCriteria.length > 0 ? (
            <ul className="space-y-2">
              {userStory.acceptanceCriteria.map((criteria, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <input
                    type="checkbox"
                    checked={criteria.completed}
                    disabled
                    className="rounded"
                  />
                  <span
                    className={
                      criteria.completed
                        ? 'line-through text-gray-500'
                        : ''
                    }
                  >
                    {criteria.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No acceptance criteria defined
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Related Tasks
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
            No tasks linked to this user story yet
          </p>
        )}
      </div>
    </div>
  )
}

