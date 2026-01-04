'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Epic } from '@/lib/api-services'
import { EpicCard } from './EpicCard'
import { useState } from 'react'

interface EpicBoardProps {
  epics: Epic[]
  onEditEpic: (epic: Epic) => void
  onDeleteEpic: (epicId: string) => void
  onEpicMove: (epics: Epic[]) => void
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
  onEpicMove,
}: EpicBoardProps) {
  const [draggedEpic, setDraggedEpic] = useState<Epic | null>(null)

  const getEpicsByStatus = (status: string) => {
    return epics
      .filter((epic) => epic.status === status)
      .sort((a, b) => a.position - b.position)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const epic = epics.find((e) => e._id === draggableId)
    if (!epic) return

    const sourceEpics = getEpicsByStatus(source.droppableId)
    const destEpics = getEpicsByStatus(destination.droppableId)

    if (source.droppableId === destination.droppableId) {
      // Reordering within same column
      const newEpics = Array.from(sourceEpics)
      const [removed] = newEpics.splice(source.index, 1)
      newEpics.splice(destination.index, 0, removed)

      const updatedEpics = newEpics.map((e, index) => ({
        ...e,
        position: index,
      }))

      const otherEpics = epics.filter(
        (e) => e.status !== source.droppableId
      )
      onEpicMove([...otherEpics, ...updatedEpics])
    } else {
      // Moving between columns
      const newSourceEpics = Array.from(sourceEpics)
      const newDestEpics = Array.from(destEpics)
      const [removed] = newSourceEpics.splice(source.index, 1)

      removed.status = destination.droppableId as Epic['status']
      newDestEpics.splice(destination.index, 0, removed)

      const updatedSourceEpics = newSourceEpics.map((e, index) => ({
        ...e,
        position: index,
      }))

      const updatedDestEpics = newDestEpics.map((e, index) => ({
        ...e,
        position: index,
      }))

      const otherEpics = epics.filter(
        (e) => e.status !== source.droppableId && e.status !== destination.droppableId
      )

      onEpicMove([...otherEpics, ...updatedSourceEpics, ...updatedDestEpics])
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 p-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => {
            const columnEpics = getEpicsByStatus(column.id)
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col"
              >
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {columnEpics.length} epics
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 ${
                      snapshot.isDraggingOver
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : ''
                    }`}
                    style={{ minHeight: '200px' }}
                  >
                    {columnEpics.map((epic, index) => (
                      <Draggable
                        key={epic._id}
                        draggableId={epic._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging
                                ? 'opacity-50 rotate-2'
                                : 'opacity-100'
                            }`}
                          >
                            <EpicCard
                              epic={epic}
                              onEdit={onEditEpic}
                              onDelete={onDeleteEpic}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
        </div>
      </DragDropContext>
    </div>
  )
}