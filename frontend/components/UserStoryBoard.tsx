'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { UserStory } from '@/lib/api-services'
import { UserStoryCard } from './UserStoryCard'
import { useState } from 'react'

interface UserStoryBoardProps {
  userStories: UserStory[]
  onUserStoryUpdate: (userStoryId: string, updates: Partial<UserStory>) => void
  onUserStoryMove: (userStories: UserStory[]) => void
}

const columns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
]

export function UserStoryBoard({
  userStories,
  onUserStoryUpdate,
  onUserStoryMove,
}: UserStoryBoardProps) {
  const getUserStoriesByStatus = (status: string) => {
    return userStories
      .filter((story) => story.status === status)
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

    const story = userStories.find((s) => s._id === draggableId)
    if (!story) return

    const sourceStories = getUserStoriesByStatus(source.droppableId)
    const destStories = getUserStoriesByStatus(destination.droppableId)

    if (source.droppableId === destination.droppableId) {
      // Reordering within same column
      const newStories = Array.from(sourceStories)
      const [removed] = newStories.splice(source.index, 1)
      newStories.splice(destination.index, 0, removed)

      const updatedStories = newStories.map((s, index) => ({
        ...s,
        position: index,
      }))

      const otherStories = userStories.filter(
        (s) => s.status !== source.droppableId
      )
      onUserStoryMove([...otherStories, ...updatedStories])
    } else {
      // Moving between columns
      const newSourceStories = Array.from(sourceStories)
      const newDestStories = Array.from(destStories)
      const [removed] = newSourceStories.splice(source.index, 1)

      removed.status = destination.droppableId as UserStory['status']
      newDestStories.splice(destination.index, 0, removed)

      const updatedSourceStories = newSourceStories.map((s, index) => ({
        ...s,
        position: index,
      }))

      const updatedDestStories = newDestStories.map((s, index) => ({
        ...s,
        position: index,
      }))

      const otherStories = userStories.filter(
        (s) =>
          s.status !== source.droppableId &&
          s.status !== destination.droppableId
      )

      onUserStoryMove([
        ...otherStories,
        ...updatedSourceStories,
        ...updatedDestStories,
      ])
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 p-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => {
            const columnStories = getUserStoriesByStatus(column.id)
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
                  {columnStories.length} stories
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 overflow-y-auto ${
                      snapshot.isDraggingOver
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : ''
                    }`}
                    style={{ minHeight: '200px', maxHeight: 'calc(100vh - 300px)' }}
                  >
                    {columnStories.map((story, index) => (
                      <Draggable
                        key={story._id}
                        draggableId={story._id}
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
                            <UserStoryCard
                              userStory={story}
                              onUpdate={(updates) =>
                                onUserStoryUpdate(story._id, updates)
                              }
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

