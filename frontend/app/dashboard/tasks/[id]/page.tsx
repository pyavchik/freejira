'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  taskService,
  commentService,
  activityService,
  Task,
  Comment,
  Activity,
} from '@/lib/api-services'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const [commentText, setCommentText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Task>>({})

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getById(taskId),
  })

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getAll(taskId),
    enabled: !!taskId,
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', taskId],
    queryFn: () => activityService.getAll(taskId),
    enabled: !!taskId,
  })

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Task>) => {
      // Convert assignee object to ID string if present
      const updateData: any = { ...updates }
      if (updates.assignee && typeof updates.assignee === 'object') {
        updateData.assignee = updates.assignee._id
      }
      return taskService.update(taskId, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update task')
    },
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      commentService.create({ content, task: taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      queryClient.invalidateQueries({ queryKey: ['activities', taskId] })
      setCommentText('')
      toast.success('Comment added!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add comment')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => commentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      queryClient.invalidateQueries({ queryKey: ['activities', taskId] })
      toast.success('Comment deleted!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete comment')
    },
  })

  const handleEdit = () => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateMutation.mutate(editData)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      commentMutation.mutate(commentText)
    }
  }

  if (taskLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-8">
        <p className="text-gray-600 dark:text-gray-400">Task not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${task.project._id}`}
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
                {task.title}
              </h1>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.project.key}-{task._id.slice(-4)}
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
                    status: e.target.value as Task['status'],
                  })
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {task.status.replace('-', ' ')}
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
                    priority: e.target.value as Task['priority'],
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
                {task.priority}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reporter
            </label>
            <p className="text-gray-900 dark:text-white">
              {task.reporter.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <p className="text-gray-900 dark:text-white">
              {task.assignee ? task.assignee.name : 'Unassigned'}
            </p>
          </div>
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
              {task.description || 'No description'}
            </p>
          )}
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtasks
            </label>
            <ul className="space-y-2">
              {task.subtasks.map((subtask, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => {
                      const updatedSubtasks = [...task.subtasks]
                      updatedSubtasks[index].completed = e.target.checked
                      updateMutation.mutate({ subtasks: updatedSubtasks })
                    }}
                    className="rounded"
                  />
                  <span
                    className={
                      subtask.completed
                        ? 'line-through text-gray-500'
                        : ''
                    }
                  >
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Comments
          </h2>
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              rows={3}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              disabled={commentMutation.isPending || !commentText.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {commentMutation.isPending ? 'Adding...' : 'Add Comment'}
            </button>
          </form>
          <div className="space-y-4">
            {commentsLoading ? (
              <p className="text-gray-500">Loading comments...</p>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {comment.author.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(comment.createdAt)}
                          {comment.edited && ' (edited)'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this comment?')) {
                          deleteCommentMutation.mutate(comment._id)
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Activity
          </h2>
          <div className="space-y-4">
            {activitiesLoading ? (
              <p className="text-gray-500">Loading activity...</p>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity._id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user.name}</span>{' '}
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No activity yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

