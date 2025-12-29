'use client'

import { Epic } from '@/lib/api-services'
import { EpicCard } from './EpicCard'

interface EpicBoardProps {
  epics: Epic[]
  onEditEpic: (epic: Epic) => void
  onDeleteEpic: (epicId: string) => void
}

const columns = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export function EpicBoard({
  epics,
  onEditEpic,
  onDeleteEpic,
}: EpicBoardProps) {
  const getEpicsByStatus = (status: string) => {
    return epics.filter((epic) => epic.status === status)
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div className="flex gap-6 p-6" style={{ minWidth: 'max-content', overflow: 'visible' }}>
        {columns.map((column) => {
          const columnEpics = getEpicsByStatus(column.id)
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {columnEpics.length} epics
                </span>
              </div>

              <div
                className="flex-1 space-y-3"
                style={{ minHeight: '200px' }}
              >
                {columnEpics.map((epic) => (
                  <EpicCard
                    key={epic._id}
                    epic={epic}
                    onEdit={onEditEpic}
                    onDelete={onDeleteEpic}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}