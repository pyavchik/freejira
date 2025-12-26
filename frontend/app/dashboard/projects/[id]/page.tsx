'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  projectService,
  taskService,
  userStoryService,
  Task,
  UserStory,
} from '@/lib/api-services'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'
import { UserStoryBoard } from '@/components/UserStoryBoard'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [activeTab, setActiveTab] = useState<'tasks' | 'user-stories'>('tasks')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isUserStoryModalOpen, setIsUserStoryModalOpen] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
  })
  const [userStoryFormData, setUserStoryFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as UserStory['priority'],
    storyPoints: 0,
  })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId),
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getAll(projectId),
    enabled: !!projectId,
  })

  const { data: userStories, isLoading: userStoriesLoading } = useQuery({
    queryKey: ['user-stories', projectId],
    queryFn: () => userStoryService.getAll(projectId),
    enabled: !!projectId,
  })

  const queryClient = useQueryClient()

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      project: string
      priority?: string
    }) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task created!')
      setIsTaskModalOpen(false)
      setTaskFormData({ title: '', description: '', priority: 'medium' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create task')
    },
  })

  const createUserStoryMutation = useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      project: string
      priority?: string
      storyPoints?: number
    }) => userStoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] })
      toast.success('User Story created!')
      setIsUserStoryModalOpen(false)
      setUserStoryFormData({
        title: '',
        description: '',
        priority: 'medium',
        storyPoints: 0,
      })
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Failed to create user story'
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string
      updates: Partial<Task>
    }) => {
      // Convert assignee object to ID string if present
      const updateData: any = { ...updates }
      if (updates.assignee && typeof updates.assignee === 'object') {
        updateData.assignee = updates.assignee._id
      }
      return taskService.update(taskId, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update task')
    },
  })

  const moveMutation = useMutation({
    mutationFn: (tasks: Task[]) => taskService.updatePositions(tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to move task')
    },
  })

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTaskMutation.mutate({
      ...taskFormData,
      project: projectId,
    })
  }

  const handleUserStorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUserStoryMutation.mutate({
      ...userStoryFormData,
      project: projectId,
    })
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    updateMutation.mutate({ taskId, updates })
  }

  const handleTaskMove = (updatedTasks: Task[]) => {
    moveMutation.mutate(updatedTasks)
  }

  const updateUserStoryMutation = useMutation({
    mutationFn: ({
      userStoryId,
      updates,
    }: {
      userStoryId: string
      updates: Partial<UserStory>
    }) => userStoryService.update(userStoryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] })
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Failed to update user story'
      )
    },
  })

  const moveUserStoryMutation = useMutation({
    mutationFn: (userStories: UserStory[]) =>
      userStoryService.updatePositions(userStories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] })
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Failed to move user story'
      )
    },
  })

  const handleUserStoryUpdate = (
    userStoryId: string,
    updates: Partial<UserStory>
  ) => {
    updateUserStoryMutation.mutate({ userStoryId, updates })
  }

  const handleUserStoryMove = (updatedUserStories: UserStory[]) => {
    moveUserStoryMutation.mutate(updatedUserStories)
  }

  if (tasksLoading || userStoriesLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ overflow: 'hidden' }}>
      <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="mb-4">
          <Link
            href={`/dashboard/workspaces/${project?.workspace._id}`}
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Back to Workspace
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {project?.key} • {tasks?.length || 0} tasks •{' '}
              {userStories?.length || 0} user stories
            </p>
          </div>
          <button
            onClick={() =>
              activeTab === 'tasks'
                ? setIsTaskModalOpen(true)
                : setIsUserStoryModalOpen(true)
            }
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New {activeTab === 'tasks' ? 'Task' : 'User Story'}
          </button>
        </div>
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('user-stories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user-stories'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              User Stories
            </button>
          </nav>
        </div>
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Task
            </h2>
            <form onSubmit={handleTaskSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={taskFormData.priority}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      priority: e.target.value as Task['priority'],
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUserStoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create User Story
            </h2>
            <form onSubmit={handleUserStorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={userStoryFormData.title}
                  onChange={(e) =>
                    setUserStoryFormData({
                      ...userStoryFormData,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  value={userStoryFormData.description}
                  onChange={(e) =>
                    setUserStoryFormData({
                      ...userStoryFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={userStoryFormData.priority}
                  onChange={(e) =>
                    setUserStoryFormData({
                      ...userStoryFormData,
                      priority: e.target.value as UserStory['priority'],
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={userStoryFormData.storyPoints}
                  onChange={(e) =>
                    setUserStoryFormData({
                      ...userStoryFormData,
                      storyPoints: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUserStoryModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserStoryMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createUserStoryMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1" style={{ overflow: 'hidden' }}>
        {activeTab === 'tasks' ? (
          tasks && tasks.length > 0 ? (
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskMove={handleTaskMove}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No tasks yet. Create your first task to get started!
              </p>
            </div>
          )
        ) : userStories && userStories.length > 0 ? (
          <UserStoryBoard
            userStories={userStories}
            onUserStoryUpdate={handleUserStoryUpdate}
            onUserStoryMove={handleUserStoryMove}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No user stories yet. Create your first user story to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

