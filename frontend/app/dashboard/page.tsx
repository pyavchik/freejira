'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workspaceService, Workspace } from '@/lib/api-services'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getAll(),
  })

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your workspaces and projects
        </p>
      </div>

      <div className="mb-6">
        <Link
          href="/dashboard/workspaces/new"
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
          New Workspace
        </Link>
      </div>

      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Link
              key={workspace._id}
              href={`/dashboard/workspaces/${workspace._id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {workspace.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {workspace.members.length} member
                  {workspace.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No workspaces yet. Create your first workspace to get started!
          </p>
          <Link
            href="/dashboard/workspaces/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Workspace
          </Link>
        </div>
      )}
    </div>
  )
}

