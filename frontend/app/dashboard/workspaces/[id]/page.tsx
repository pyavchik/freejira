'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService, projectService, Project } from '@/lib/api-services'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import ConfirmationModal from '@/components/ConfirmationModal'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  })

  // Redirect if trying to access "new" route
  useEffect(() => {
    if (workspaceId === 'new') {
      router.push('/dashboard/workspaces');
    }
  }, [workspaceId, router])

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => {
      return workspaceService.getById(workspaceId);
    },
    enabled: workspaceId !== 'new',
  })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => {
      return projectService.getAll(workspaceId);
    },
    enabled: !!workspaceId && workspaceId !== 'new',
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      key: string
      description?: string
      workspace: string
    }) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
      toast.success('Project created!')
      setIsModalOpen(false)
      setFormData({ name: '', key: '', description: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create project')
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
      toast.success('Project deleted successfully!')
      setIsDeleteModalOpen(false)
      setSelectedProject(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete project')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      workspace: workspaceId,
      key: formData.key.toUpperCase(),
    })
  }

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedProject) {
      deleteProjectMutation.mutate(selectedProject._id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/workspaces"
          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
        >
          ← Back to Workspaces
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {workspace?.name}
        </h1>
        {workspace?.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {workspace.description}
          </p>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Projects
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
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
          New Project
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Project
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key (e.g., PROJ)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      key: e.target.value.toUpperCase(),
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="relative block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDeleteProject(project);
                }}
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500"
                aria-label={`Delete project ${project.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <Link
                href={`/dashboard/projects/${project._id}`}
                className="absolute inset-0"
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {project.key}
              </p>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {project.members.length} member
                  {project.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No projects yet. Create your first project to get started!
          </p>
        </div>
      )}

      {selectedProject && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Project"
          message={`Are you sure you want to delete project "${selectedProject.name}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      )}
    </div>
  )
}

