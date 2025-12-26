'use client'

import { UserStory } from '@/lib/api-services'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UserStoryCardProps {
  userStory: UserStory
  onUpdate: (updates: Partial<UserStory>) => void
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function UserStoryCard({ userStory, onUpdate }: UserStoryCardProps) {
  const completedCriteria =
    userStory.acceptanceCriteria?.filter((ac) => ac.completed).length || 0
  const totalCriteria = userStory.acceptanceCriteria?.length || 0

  return (
    <Link href={`/dashboard/user-stories/${userStory._id}`}>
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex-1">
            {userStory.title}
          </h3>
          <div className="flex items-center space-x-2 ml-2">
            {userStory.storyPoints > 0 && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                {userStory.storyPoints} SP
              </span>
            )}
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded',
                priorityColors[userStory.priority]
              )}
            >
              {userStory.priority}
            </span>
          </div>
        </div>

        {userStory.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {userStory.description}
          </p>
        )}

        {totalCriteria > 0 && (
          <div className="mb-3">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {completedCriteria}/{totalCriteria} acceptance criteria
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {userStory.assignee ? (
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                  {userStory.assignee.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Unassigned</span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userStory.project.key}-US-{userStory._id.slice(-4)}
          </span>
        </div>
      </div>
    </Link>
  )
}

