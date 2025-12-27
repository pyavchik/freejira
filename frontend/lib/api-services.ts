import api from './api'

// Types
export interface Workspace {
  _id: string
  name: string
  description?: string
  owner: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  members: Array<{
    user: {
      _id: string
      name: string
      email: string
      avatar?: string
    }
    role: 'owner' | 'admin' | 'user'
  }>
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  name: string
  description?: string
  key: string
  workspace: {
    _id: string
    name: string
  }
  lead?: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  members: Array<{
    _id: string
    name: string
    email: string
    avatar?: string
  }>
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface UserStory {
  _id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project: {
    _id: string
    name: string
    key: string
  }
  assignee?: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  reporter: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  acceptanceCriteria: Array<{
    description: string
    completed: boolean
  }>
  storyPoints: number
  labels: string[]
  dueDate?: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project: {
    _id: string
    name: string
    key: string
  }
  userStory?: {
    _id: string
    title: string
  }
  assignee?: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  reporter: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  subtasks: Array<{
    title: string
    completed: boolean
  }>
  labels: string[]
  dueDate?: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  content: string
  task: {
    _id: string
    title: string
  }
  author: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  edited: boolean
  createdAt: string
  updatedAt: string
}

export interface Activity {
  _id: string
  type: string
  task: {
    _id: string
    title: string
  }
  user: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  description: string
  metadata?: Record<string, any>
  createdAt: string
}

// API Services
export const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const response = await api.get<{ success: boolean; data: Workspace[] }>(
      '/workspaces'
    )
    return response.data.data
  },

  getById: async (id: string): Promise<Workspace> => {
    const response = await api.get<{ success: boolean; data: Workspace }>(
      `/workspaces/${id}`
    )
    return response.data.data
  },

  create: async (data: { name: string; description?: string }): Promise<Workspace> => {
    const response = await api.post<{ success: boolean; data: Workspace }>(
      '/workspaces',
      data
    )
    return response.data.data
  },

  update: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Workspace> => {
    const response = await api.put<{ success: boolean; data: Workspace }>(
      `/workspaces/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`)
  },
}

export const projectService = {
  getAll: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<{ success: boolean; data: Project[] }>(
      `/projects/workspace/${workspaceId}`
    )
    return response.data.data
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<{ success: boolean; data: Project }>(
      `/projects/${id}`
    )
    return response.data.data
  },

  create: async (data: {
    name: string
    key: string
    description?: string
    workspace: string
  }): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>(
      '/projects',
      data
    )
    return response.data.data
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; status?: string }
  ): Promise<Project> => {
    const response = await api.put<{ success: boolean; data: Project }>(
      `/projects/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}

export const taskService = {
  getAll: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<{ success: boolean; data: Task[] }>(
      `/tasks/project/${projectId}`
    )
    return response.data.data
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<{ success: boolean; data: Task }>(
      `/tasks/${id}`
    )
    return response.data.data
  },

  create: async (data: {
    title: string
    description?: string
    project: string
    priority?: string
    assignee?: string
  }): Promise<Task> => {
    const response = await api.post<{ success: boolean; data: Task }>(
      `/tasks/project/${data.project}`,
      data
    )
    return response.data.data
  },

  update: async (
    id: string,
    data: {
      title?: string
      description?: string
      status?: string
      priority?: string
      assignee?: string
      subtasks?: Array<{ title: string; completed: boolean }>
    }
  ): Promise<Task> => {
    const response = await api.put<{ success: boolean; data: Task }>(
      `/tasks/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  updatePositions: async (tasks: Task[]): Promise<Task[]> => {
    const response = await api.put<{ success: boolean; data: Task[] }>(
      '/tasks/positions/update',
      { tasks }
    )
    return response.data.data
  },

  getMy: async (): Promise<Task[]> => {
    const response = await api.get<{ success: boolean; data: Task[] }>(
      '/tasks/my'
    )
    return response.data.data
  },
}

export const commentService = {
  getAll: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<{ success: boolean; data: Comment[] }>(
      `/comments/task/${taskId}`
    )
    return response.data.data
  },

  create: async (data: { content: string; task: string }): Promise<Comment> => {
    const response = await api.post<{ success: boolean; data: Comment }>(
      '/comments',
      data
    )
    return response.data.data
  },

  update: async (id: string, data: { content: string }): Promise<Comment> => {
    const response = await api.put<{ success: boolean; data: Comment }>(
      `/comments/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}

export const activityService = {
  getAll: async (taskId: string): Promise<Activity[]> => {
    const response = await api.get<{ success: boolean; data: Activity[] }>(
      `/activities/task/${taskId}`
    )
    return response.data.data
  },
}

export const userStoryService = {
  getAll: async (projectId: string): Promise<UserStory[]> => {
    const response = await api.get<{ success: boolean; data: UserStory[] }>(
      `/user-stories/project/${projectId}`
    )
    return response.data.data
  },

  getById: async (id: string): Promise<UserStory> => {
    const response = await api.get<{ success: boolean; data: UserStory }>(
      `/user-stories/${id}`
    )
    return response.data.data
  },

  create: async (data: {
    title: string
    description?: string
    project: string
    priority?: string
    assignee?: string
    storyPoints?: number
    acceptanceCriteria?: Array<{ description: string; completed?: boolean }>
  }): Promise<UserStory> => {
    const response = await api.post<{ success: boolean; data: UserStory }>(
      `/user-stories/project/${data.project}`,
      data
    )
    return response.data.data
  },

  update: async (
    id: string,
    data: {
      title?: string
      description?: string
      status?: string
      priority?: string
      assignee?: string
      storyPoints?: number
      acceptanceCriteria?: Array<{ description: string; completed: boolean }>
    }
  ): Promise<UserStory> => {
    const response = await api.put<{ success: boolean; data: UserStory }>(
      `/user-stories/${id}`,
      data
    )
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/user-stories/${id}`)
  },

  getTasks: async (userStoryId: string): Promise<Task[]> => {
    const response = await api.get<{ success: boolean; data: Task[] }>(
      `/user-stories/${userStoryId}/tasks`
    )
    return response.data.data
  },

  updatePositions: async (userStories: UserStory[]): Promise<UserStory[]> => {
    const response = await api.put<{ success: boolean; data: UserStory[] }>(
      '/user-stories/positions/update',
      { userStories }
    )
    return response.data.data
  },
}

export const usersService = {
  getAll: async (): Promise<Array<{ _id: string; name: string; email: string; avatar?: string; role?: string }>> => {
    const response = await api.get<{ success: boolean; data: any[] }>(
      '/users'
    )
    return response.data.data
  },
}
