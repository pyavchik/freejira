'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Epic } from '@/lib/api-services'

interface EditEpicModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (epicId: string, updates: {
    name?: string
    description?: string
    status?: string
    priority?: string
    assignee?: string
    startDate?: string
    dueDate?: string
    labels?: string[]
  }) => void
  epic: Epic | null
  projectMembers: Array<{ _id: string; name: string; email: string }>
}

export default function EditEpicModal({
  isOpen,
  onClose,
  onSave,
  epic,
  projectMembers,
}: EditEpicModalProps) {
  const [name, setName] = useState(epic?.name || '')
  const [description, setDescription] = useState(epic?.description || '')
  const [priority, setPriority] = useState<Epic['priority']>(epic?.priority || 'medium')
  const [status, setStatus] = useState<Epic['status']>(epic?.status || 'todo')
  const [assignee, setAssignee] = useState<string>(epic?.assignee?._id || '')
  const [startDate, setStartDate] = useState(epic?.startDate ? epic.startDate.split('T')[0] : '')
  const [dueDate, setDueDate] = useState(epic?.dueDate ? epic.dueDate.split('T')[0] : '')
  const [labels, setLabels] = useState(epic?.labels?.join(', ') || '')

  useEffect(() => {
    if (epic) {
      setName(epic.name)
      setDescription(epic.description || '')
      setPriority(epic.priority)
      setStatus(epic.status)
      setAssignee(epic.assignee?._id || '')
      setStartDate(epic.startDate ? epic.startDate.split('T')[0] : '')
      setDueDate(epic.dueDate ? epic.dueDate.split('T')[0] : '')
      setLabels(epic.labels?.join(', ') || '')
    }
  }, [epic])

  const handleSave = () => {
    if (epic) {
      const updates = {
        name,
        description,
        priority,
        status,
        assignee: assignee || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        labels: labels ? labels.split(',').map(l => l.trim()).filter(l => l) : [],
      }
      onSave(epic._id, updates)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Edit Epic
                    </Dialog.Title>
                    <div className="mt-2 space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="priority"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Priority
                          </label>
                          <select
                            id="priority"
                            name="priority"
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Epic['priority'])}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Epic['status'])}
                          >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="assignee"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Assignee
                        </label>
                        <select
                          id="assignee"
                          name="assignee"
                          className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          value={assignee}
                          onChange={(e) => setAssignee(e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {projectMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} ({member.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="startDate"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="dueDate"
                            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                          >
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            id="dueDate"
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="labels"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Labels (comma separated)
                        </label>
                        <input
                          type="text"
                          name="labels"
                          id="labels"
                          className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                          value={labels}
                          onChange={(e) => setLabels(e.target.value)}
                          placeholder="bug, feature, urgent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}