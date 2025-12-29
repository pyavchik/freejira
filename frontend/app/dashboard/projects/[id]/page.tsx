'use client';

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  projectService,
  taskService,
  userStoryService,
  usersService,
  epicService,
  Task,
  UserStory,
  Epic,
} from '@/lib/api-services'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/KanbanBoard'
import { UserStoryBoard } from '@/components/UserStoryBoard'
import { EpicBoard } from '@/components/EpicBoard'
import toast from 'react-hot-toast'
import Link from 'next/link'
import api from '@/lib/api'
import EditTaskModal from '@/components/EditTaskModal'
import EditEpicModal from '@/components/EditEpicModal'
import ConfirmationModal from '@/components/ConfirmationModal'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [activeTab, setActiveTab] = useState<'tasks' | 'user-stories' | 'epics'>('tasks')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isUserStoryModalOpen, setIsUserStoryModalOpen] = useState(false)
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditEpicModalOpen, setIsEditEpicModalOpen] = useState(false)
  const [isDeleteEpicModalOpen, setIsDeleteEpicModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignee: '' as string | undefined, // Allow undefined for unassigned
    epic: '' as string | undefined, // Allow undefined for no epic
    userStory: '' as string | undefined, // Allow undefined for no user story
  })
  const [userStoryFormData, setUserStoryFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as UserStory['priority'],
    storyPoints: 0,
  })
  const [epicFormData, setEpicFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Epic['priority'],
    assignee: '' as string | undefined,
    startDate: '',
    dueDate: '',
    labels: '',
  })
  const [selectedUserId, setSelectedUserId] = useState('')

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId),
  })

  const projectMembers = project?.members || []

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

  const { data: epics, isLoading: epicsLoading } = useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => epicService.getAll(projectId),
    enabled: !!projectId,
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const queryClient = useQueryClient()

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      project: string
      priority?: string
      assignee?: string
    }) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task created!')
      setIsTaskModalOpen(false)
      setTaskFormData({ title: '', description: '', priority: 'medium', assignee: undefined, epic: undefined, userStory: undefined })
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

  const createEpicMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      project: string
      priority?: string
      assignee?: string
      startDate?: string
      dueDate?: string
      labels?: string[]
    }) => epicService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
      toast.success('Epic created!')
      setIsEpicModalOpen(false)
      setEpicFormData({
        name: '',
        description: '',
        priority: 'medium',
        assignee: undefined,
        startDate: '',
        dueDate: '',
        labels: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create epic')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> & { assignee?: any } }) => {
      const updateData: Partial<Task> & { assignee?: string } = { ...updates };
      if (updates.assignee && typeof updates.assignee === 'object') {
        updateData.assignee = updates.assignee._id;
      }
      return taskService.update(taskId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task updated successfully!')
      setIsEditModalOpen(false)
      setSelectedTask(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update task')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Task deleted successfully!')
      setIsDeleteModalOpen(false)
      setSelectedTask(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete task')
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

  const addUserMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/add-user`, { userId: selectedUserId }),
    onSuccess: () => {
      setIsAddUserModalOpen(false)
      setSelectedUserId('')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('User added to project!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add user')
    },
  })

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      ...taskFormData,
      project: projectId,
    }
    // Clean up empty fields
    if (!payload.assignee) {
      delete payload.assignee
    }
    if (!payload.epic) {
      delete payload.epic
    }
    if (!payload.userStory) {
      delete payload.userStory
    }
    createTaskMutation.mutate(payload)
  }

  const handleUserStorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUserStoryMutation.mutate({
      ...userStoryFormData,
      project: projectId,
    })
  }

  const handleEpicSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      ...epicFormData,
      project: projectId,
      labels: epicFormData.labels ? epicFormData.labels.split(',').map(l => l.trim()).filter(l => l) : [],
    }
    if (!payload.assignee) {
      delete payload.assignee
    }
    if (!payload.startDate) {
      delete payload.startDate
    }
    if (!payload.dueDate) {
      delete payload.dueDate
    }
    createEpicMutation.mutate(payload)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    setSelectedTask(tasks?.find((t) => t._id === taskId) || null)
    setIsDeleteModalOpen(true)
  }

  const handleEditEpic = (epic: Epic) => {
    setSelectedEpic(epic)
    setIsEditEpicModalOpen(true)
  }

  const handleDeleteEpic = (epicId: string) => {
    setSelectedEpic(epics?.find((e) => e._id === epicId) || null)
    setIsDeleteEpicModalOpen(true)
  }

  const handleSaveEditedTask = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, updates })
  }

  const handleConfirmDeleteTask = () => {
    if (selectedTask) {
      deleteTaskMutation.mutate(selectedTask._id)
    }
  }

  const handleSaveEditedEpic = (epicId: string, updates: {
    name?: string
    description?: string
    status?: string
    priority?: string
    assignee?: string
    startDate?: string
    dueDate?: string
    labels?: string[]
  }) => {
    updateEpicMutation.mutate({ epicId, updates })
  }

  const handleConfirmDeleteEpic = () => {
    if (selectedEpic) {
      deleteEpicMutation.mutate(selectedEpic._id)
    }
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
    }) => {
      // Convert assignee object to ID string if present
      const updateData: any = { ...updates }
      if (updates.assignee && typeof updates.assignee === 'object') {
        updateData.assignee = updates.assignee._id
      }
      return userStoryService.update(userStoryId, updateData)
    },
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

  const updateEpicMutation = useMutation({
    mutationFn: ({
      epicId,
      updates,
    }: {
      epicId: string
      updates: {
        name?: string
        description?: string
        status?: string
        priority?: string
        assignee?: string
        startDate?: string
        dueDate?: string
        labels?: string[]
      }
    }) => epicService.update(epicId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
      toast.success('Epic updated successfully!')
      setIsEditEpicModalOpen(false)
      setSelectedEpic(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update epic')
    },
  })

  const deleteEpicMutation = useMutation({
    mutationFn: (epicId: string) => epicService.delete(epicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] })
      toast.success('Epic deleted successfully!')
      setIsDeleteEpicModalOpen(false)
      setSelectedEpic(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete epic')
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

  if (tasksLoading || userStoriesLoading || epicsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
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
              {userStories?.length || 0} user stories •{' '}
              {epics?.length || 0} epics
            </p>
            {project?.members && project.members.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Members</h3>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {project.members.map((m) => (
                    <li key={m._id} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-medium flex items-center justify-center">
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{m.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{m.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                if (activeTab === 'tasks') setIsTaskModalOpen(true)
                else if (activeTab === 'user-stories') setIsUserStoryModalOpen(true)
                else if (activeTab === 'epics') setIsEpicModalOpen(true)
              }}
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
              New {activeTab === 'tasks' ? 'Task' : activeTab === 'user-stories' ? 'User Story' : 'Epic'}
            </button>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="ml-3 inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add User to Project
            </button>
          </div>
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
            <button
              onClick={() => setActiveTab('epics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'epics'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Epics
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To (optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={taskFormData.assignee}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, assignee: e.target.value })
                  }
                  disabled={!projectMembers.length}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {!projectMembers.length && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add project members to enable assignment.
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Epic (optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={taskFormData.epic}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, epic: e.target.value })
                  }
                >
                  <option value="">No Epic</option>
                  {epics?.map((epic) => (
                    <option key={epic._id} value={epic._id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Story (optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={taskFormData.userStory}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, userStory: e.target.value })
                  }
                >
                  <option value="">No User Story</option>
                  {userStories?.map((story) => (
                    <option key={story._id} value={story._id}>
                      {story.title}
                    </option>
                  ))}
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

      {isEpicModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Epic
            </h2>
            <form onSubmit={handleEpicSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={epicFormData.name}
                  onChange={(e) =>
                    setEpicFormData({ ...epicFormData, name: e.target.value })
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
                  value={epicFormData.description}
                  onChange={(e) =>
                    setEpicFormData({
                      ...epicFormData,
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
                  value={epicFormData.priority}
                  onChange={(e) =>
                    setEpicFormData({
                      ...epicFormData,
                      priority: e.target.value as Epic['priority'],
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To (optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={epicFormData.assignee}
                  onChange={(e) =>
                    setEpicFormData({ ...epicFormData, assignee: e.target.value })
                  }
                  disabled={!projectMembers.length}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {!projectMembers.length && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add project members to enable assignment.
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date (optional)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={epicFormData.startDate}
                  onChange={(e) =>
                    setEpicFormData({ ...epicFormData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={epicFormData.dueDate}
                  onChange={(e) =>
                    setEpicFormData({ ...epicFormData, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Labels (comma separated, optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={epicFormData.labels}
                  onChange={(e) =>
                    setEpicFormData({ ...epicFormData, labels: e.target.value })
                  }
                  placeholder="bug, feature, urgent"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEpicModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEpicMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createEpicMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add User to Project
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select User
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {users?.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addUserMutation.isPending || !selectedUserId}
                onClick={() => addUserMutation.mutate()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {addUserMutation.isPending ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1" style={{ overflow: 'hidden' }}>
        {activeTab === 'tasks' ? (
          tasks && tasks.length > 0 ? (
            <KanbanBoard
              tasks={tasks}
              onTaskMove={handleTaskMove}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No tasks yet. Create your first task to get started!
              </p>
            </div>
          )
        ) : activeTab === 'user-stories' ? (
          userStories && userStories.length > 0 ? (
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
          )
        ) : activeTab === 'epics' ? (
          epics && epics.length > 0 ? (
            <EpicBoard
              epics={epics}
              onEditEpic={handleEditEpic}
              onDeleteEpic={handleDeleteEpic}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No epics yet. Create your first epic to get started!
              </p>
            </div>
          )
        ) : null}
      </div>

      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditedTask}
          task={selectedTask}
        />
      )}

      {selectedTask && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteTask}
          title="Delete Task"
          message={`Are you sure you want to delete task "${selectedTask.title}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      )}

      {selectedEpic && (
        <EditEpicModal
          isOpen={isEditEpicModalOpen}
          onClose={() => setIsEditEpicModalOpen(false)}
          onSave={handleSaveEditedEpic}
          epic={selectedEpic}
          projectMembers={projectMembers}
        />
      )}

      {selectedEpic && (
        <ConfirmationModal
          isOpen={isDeleteEpicModalOpen}
          onClose={() => setIsDeleteEpicModalOpen(false)}
          onConfirm={handleConfirmDeleteEpic}
          title="Delete Epic"
          message={`Are you sure you want to delete epic "${selectedEpic.name}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      )}
    </div>
  )
}

