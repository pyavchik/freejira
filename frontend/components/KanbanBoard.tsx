'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Task } from '@/lib/api-services'
import { TaskCard } from './TaskCard'
import { useState } from 'react'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (tasks: Task[]) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

const columns = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export function KanbanBoard({
  tasks,
  onTaskMove,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  console.log('KanbanBoard received onDeleteTask:', onDeleteTask);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
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

    const task = tasks.find((t) => t._id === draggableId)
    if (!task) return

    const sourceTasks = getTasksByStatus(source.droppableId)
    const destTasks = getTasksByStatus(destination.droppableId)

    if (source.droppableId === destination.droppableId) {
      // Reordering within same column
      const newTasks = Array.from(sourceTasks)
      const [removed] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, removed)

      const updatedTasks = newTasks.map((t, index) => ({
        ...t,
        position: index,
      }))

      const otherTasks = tasks.filter(
        (t) => t.status !== source.droppableId
      )
      onTaskMove([...otherTasks, ...updatedTasks])
    } else {
      // Moving between columns
      const newSourceTasks = Array.from(sourceTasks)
      const newDestTasks = Array.from(destTasks)
      const [removed] = newSourceTasks.splice(source.index, 1)

      removed.status = destination.droppableId as Task['status']
      newDestTasks.splice(destination.index, 0, removed)

      const updatedSourceTasks = newSourceTasks.map((t, index) => ({
        ...t,
        position: index,
      }))

      const updatedDestTasks = newDestTasks.map((t, index) => ({
        ...t,
        position: index,
      }))

      const otherTasks = tasks.filter(
        (t) => t.status !== source.droppableId && t.status !== destination.droppableId
      )

      onTaskMove([...otherTasks, ...updatedSourceTasks, ...updatedDestTasks])
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 p-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
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
                  {columnTasks.length} tasks
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
                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
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
                            <TaskCard
                              task={task}
                              onEdit={onEditTask}
                              onDelete={onDeleteTask}
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

