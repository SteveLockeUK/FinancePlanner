import { useState, useEffect, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox'

export interface FieldConfig {
  type?: FieldType
  options?: { label: string; value: any }[]
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  hidden?: boolean
}

export interface ColumnDef<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  requiredOnAdd?: boolean
  fieldConfig?: FieldConfig
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T extends Record<string, any>> {
  entityName: string
  columns: ColumnDef<T>[]
  rows: T[]
  pageSize?: number
  showPagination?: boolean
  showSearch?: boolean
  onAdd?: () => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  // New props for integrated dialogs
  enableAddDialog?: boolean
  enableEditDialog?: boolean
  enableDeleteDialog?: boolean
  onSaveAdd?: (data: Partial<T>) => void | Promise<void>
  onSaveEdit?: (data: T) => void | Promise<void>
  onConfirmDelete?: (row: T) => void | Promise<void>
  getRowId?: (row: T) => string | number
  getRowDisplayName?: (row: T) => string
  defaultSortColumn?: string | null
  defaultSortDirection?: SortDirection | null
}

type SortDirection = 'asc' | 'desc' | null

export default function DataTable<T extends Record<string, any>>({
  entityName,
  columns,
  rows,
  showPagination = true,
  showSearch = true,
  onAdd,
  onEdit,
  onDelete,
  enableAddDialog = false,
  enableEditDialog = false,
  enableDeleteDialog = false,
  onSaveAdd,
  onSaveEdit,
  onConfirmDelete,
  getRowId = (row: T) => (row as any).id,
  getRowDisplayName = (row: T) => {
    const nameColumn = columns.find(col => col.key === 'name' || col.key === 'title')
    return nameColumn ? String(row[nameColumn.key] || '') : `${entityName} #${getRowId(row)}`
  },
  defaultSortColumn = null,
  defaultSortDirection = null
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if(defaultSortColumn && defaultSortDirection) {
      setSortColumn(defaultSortColumn)
      setSortDirection(defaultSortDirection)
    }
  }, [defaultSortColumn, defaultSortDirection])

  // Get editable columns (only those explicitly marked as editable)
  const editEntityColumns = useMemo(() => {
    return columns.filter(col => col.editable === true)
  }, [columns])

  const addEntityColumns = useMemo(() => {
    return columns.filter(col => col.editable || col.requiredOnAdd)
  }, [columns])

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows

    const searchLower = searchTerm.toLowerCase()
    return rows.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [rows, searchTerm, columns])

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRows

    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Compare values
      let comparison = 0
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.toISOString().localeCompare(bValue.toISOString())
      }
      else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortColumn, sortDirection])

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column || column.sortable === false) return

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRows = sortedRows.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // Check if any column has edit or delete enabled
  const hasEditableColumn = columns.some((col) => col.editable === true)
  const showActionsColumn = (hasEditableColumn && (onEdit || enableEditDialog)) || (onDelete || enableDeleteDialog)

  // Dialog handlers
  const handleAddClick = () => {
    if (enableAddDialog) {
      // Initialize form data with defaults
      const initialData: Record<string, any> = {}
      editEntityColumns.forEach(col => {
        const fieldConfig = col.fieldConfig
        if (fieldConfig?.type === 'number') {
          initialData[col.key] = 0
        } else if (fieldConfig?.type === 'date') {
          initialData[col.key] = new Date()
        } else {
          initialData[col.key] = ''
        }
      })
      setFormData(initialData as Partial<T>)
      setIsAddDialogOpen(true)
    } else if (onAdd) {
      onAdd()
    }
  }

  const handleEditClick = (row: T) => {
    if (enableEditDialog) {
      setSelectedRow(row)
      // Initialize form data with row values
      const initialData: Record<string, any> = {}
      editEntityColumns.forEach(col => {
        const value = row[col.key]
        // Handle Date objects - convert to Date if needed
        if (col.fieldConfig?.type === 'date' && value) {
          initialData[col.key] = (value instanceof Date ? value : new Date(value))
        } else {
          initialData[col.key] = value
        }
      })
      setFormData(initialData as Partial<T>)
      setIsEditDialogOpen(true)
    } else if (onEdit) {
      onEdit(row)
    }
  }

  const handleDeleteClick = (row: T) => {
    if (enableDeleteDialog) {
      setSelectedRow(row)
      setIsDeleteDialogOpen(true)
    } else if (onDelete) {
      onDelete(row)
    }
  }

  const handleSaveAdd = async () => {
    if (!onSaveAdd) return

    // Validate required fields
    for (const col of editEntityColumns) {
      if (col.fieldConfig?.required) {
        const value = formData[col.key]
        // Check if value is missing - for numbers, 0 is valid, so check for null/undefined
        // For strings, empty string is invalid
        // For dates, null/undefined is invalid
        if (value === undefined || value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (col.fieldConfig.type === 'select' && value === '')) {
          return // Don't save if required field is missing
        }
      }
    }

    setIsSaving(true)
    try {
      await onSaveAdd(formData)
      setIsAddDialogOpen(false)
      setFormData({})
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!onSaveEdit || !selectedRow) return

    // Validate required fields
    for (const col of editEntityColumns) {
      if (col.fieldConfig?.required) {
        const value = formData[col.key]
        // Check if value is missing - for numbers, 0 is valid, so check for null/undefined
        // For strings, empty string is invalid
        // For dates, null/undefined is invalid
        if (value === undefined || value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (col.fieldConfig.type === 'select' && value === '')) {
          return
        }
      }
    }

    setIsSaving(true)
    try {
      const updatedRow = { ...selectedRow, ...formData } as T
      await onSaveEdit(updatedRow)
      setIsEditDialogOpen(false)
      setSelectedRow(null)
      setFormData({})
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!onConfirmDelete || !selectedRow) return

    setIsSaving(true)
    try {
      await onConfirmDelete(selectedRow)
      setIsDeleteDialogOpen(false)
      setSelectedRow(null)
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Render form field based on column config
  const renderFormField = (column: ColumnDef<T>) => {
    const fieldConfig = column.fieldConfig || {}
    const fieldType = fieldConfig.type || 'text'
    const value = formData[column.key]
    const isReadonly = fieldConfig.readonly || false
    const isHidden = fieldConfig.hidden || false

    if (isHidden) return null

    const handleChange = (newValue: any) => {
      setFormData(prev => ({ ...prev, [column.key]: newValue }))
    }

    switch (fieldType) {
      case 'number':
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={column.key}
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value ? parseFloat(e.target.value) : '')}
              disabled={isReadonly}
              min={fieldConfig.min}
              max={fieldConfig.max}
              step={fieldConfig.step ?? 1}
              placeholder={fieldConfig.placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:bg-gray-100"
            />
          </div>
        )

      case 'select':
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={column.key}
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadonly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:bg-gray-100"
            >
              <option value="" className='text-gray-500'>Select {column.label}...</option>
              {fieldConfig.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'date':
        let dateValue = ''
        if (value) {
          if (typeof value === 'string') {
            dateValue = value.split('T')[0]
          } else {
            try {
              const val = value as any
              const dateObj = val instanceof Date ? val : new Date(val)
              if (!isNaN(dateObj.getTime())) {
                dateValue = dateObj.toISOString().split('T')[0]
              }
            } catch {
              dateValue = ''
            }
          }
        }
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={column.key}
              value={dateValue}
              onChange={(e) => handleChange(e.target.value ? new Date(e.target.value) : '')}
              disabled={isReadonly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:bg-gray-100"
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={column.key}
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadonly}
              placeholder={fieldConfig.placeholder}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:bg-gray-100"
            />
          </div>
        )
      case 'checkbox':
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="checkbox"
              id={column.key}
              checked={value ?? false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={isReadonly}
            />
          </div>
        )

      default: // text
        return (
          <div key={column.key}>
            <label htmlFor={column.key} className="block text-sm font-medium text-gray-700 mb-2">
              {column.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={column.key}
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadonly}
              placeholder={fieldConfig.placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:bg-gray-100"
            />
          </div>
        )
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return editEntityColumns.every(col => {
      if (!col.fieldConfig?.required) {
        return true
      }

      const value = formData[col.key]
      const fieldType = col.fieldConfig.type

      // For numbers, 0 is valid, so only check for null/undefined
      if (fieldType === 'number') {
        return value !== undefined && value !== null
      }

      // For select fields, empty string is invalid
      if (fieldType === 'select') {
        return value !== undefined && value !== null && value !== ''
      }

      // For strings (including text and textarea), empty string is invalid
      if (fieldType === 'text' || fieldType === 'textarea' || (fieldType === undefined && typeof value === 'string')) {
        return typeof value === 'string' && value.trim() !== ''
      }

      // For dates and other types, check for null/undefined
      return value !== undefined && value !== null
    })
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search Bar and Add Button */}
        {(showSearch || onAdd || enableAddDialog) && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              {showSearch && (
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                </div>
              )}
              {(onAdd || enableAddDialog) && (
                <button
                  onClick={handleAddClick}
                  className="btn-small flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add {entityName}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider
                      ${index < columns.length - 1 || showActionsColumn ? 'border-r border-gray-300' : ''}
                      ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                {showActionsColumn && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r-0">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (showActionsColumn ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No data found</p>
                      {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIndex) => {
                  const actualRowIndex = startIndex + rowIndex
                  const rowHasEditable = columns.some((col) => col.editable === true)

                  return (
                    <tr key={actualRowIndex} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column, colIndex) => {
                        const value = row[column.key]
                        return (
                          <td
                            key={column.key}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${colIndex < columns.length - 1 || showActionsColumn ? 'border-r border-gray-200' : ''
                              }`}
                          >
                            {column.render ? column.render(value, row) : value}
                          </td>
                        )
                      })}
                      {showActionsColumn && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {(rowHasEditable && (onEdit || enableEditDialog)) && (
                              <button
                                onClick={() => handleEditClick(row)}
                                className="btn-small flex items-center gap-1"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                              </button>
                            )}
                            {(onDelete || enableDeleteDialog) && (
                              <button
                                onClick={() => handleDeleteClick(row)}
                                className="btn-danger-small flex items-center gap-1"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, sortedRows.length)}</span> of{' '}
              <span className="font-medium">{sortedRows.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} >
                <option value="10">10</option>
                <option value="20">15</option>
                <option value="50">25</option>
                <option value="100">50</option>
              </select>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>
                  }
                  return null
                })}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      {enableAddDialog && (
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false)
            setFormData({})
          }}
          title={`Add ${entityName}`}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSaveAdd(); }}>
            <div className="space-y-4">
              {addEntityColumns.map(col => renderFormField(col))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setFormData({})
                }}
                className="btn-neutral flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || isSaving}
                className="btn flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {enableEditDialog && selectedRow && (
        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedRow(null)
            setFormData({})
          }}
          title={`Edit ${entityName}`}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
            <div className="space-y-4">
              {editEntityColumns.map(col => renderFormField(col))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedRow(null)
                  setFormData({})
                }}
                className="btn-neutral flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || isSaving}
                className="btn flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {enableDeleteDialog && selectedRow && (
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedRow(null)
          }}
          title={`Delete ${entityName}`}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleConfirmDelete(); }}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Are you sure you want to delete this {entityName.toLowerCase()}?
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2">
                    {columns.slice(0, 3).map(col => {
                      const value = selectedRow[col.key]
                      return (
                        <div key={col.key}>
                          <span className="text-sm font-medium text-gray-600">{col.label}:</span>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {col.render ? col.render(value, selectedRow) : String(value ?? '')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800">
                    ⚠️ Warning: This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedRow(null)
                }}
                className="btn-neutral flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : `Delete ${entityName}`}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  )
}

