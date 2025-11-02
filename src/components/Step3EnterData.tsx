import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Download, ArrowLeft, Trash2, Database, Search, SortAsc, SortDesc, FileDown,
  Palette, Type, Bold, Italic, Underline
} from 'lucide-react'

import toast from 'react-hot-toast'
import { ImportExportModal, CellStyleEditor } from './'
import { validateValue, formatValue } from '../utils/validation'
import { exportToExcel } from '../utils/export'
import type { Column, DataRow, CellStyle } from '../types'

interface Step3EnterDataProps {
  fileName: string
  columns: Column[]
  rows: DataRow[]
  onAddRow: (row: DataRow) => void
  onDeleteRow: (id: string) => void
  onUpdateRow: (id: string, updates: Partial<DataRow>) => void
  onUpdateColumn: (id: string, updates: Partial<Column>) => void
  onPrev: () => void
}

export default function Step3EnterData({
  fileName,
  columns,
  rows,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onUpdateColumn,
  onPrev
}: Step3EnterDataProps) {
  // Show notification if data was imported
  React.useEffect(() => {
    if (rows.length > 0 && columns.length > 0) {
      toast.success(`Loaded ${rows.length} rows with ${columns.length} columns`);
    }
  }, [columns.length, rows.length]);
  const [formData, setFormData] = useState<Record<string, string>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.defaultValue || '' }), {})
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showCellStyleEditor, setShowCellStyleEditor] = useState(false)
  const [editingCellStyle, setEditingCellStyle] = useState<{ rowId?: string; columnId?: string; type: 'cell' | 'column' | 'row' }>()
  const [currentCellStyle, setCurrentCellStyle] = useState<CellStyle>({})

  const handleInputChange = (columnId: string, value: string) => {
    setFormData(prev => ({ ...prev, [columnId]: value }))
    
    // Validate input
    const column = columns.find(col => col.id === columnId)
    if (column) {
      const validation = validateValue(value, column)
      setValidationErrors(prev => ({
        ...prev,
        [columnId]: validation.isValid ? '' : validation.error || ''
      }))
    }
  }

  const handleAddRow = () => {
    // Validate all fields
    const errors: Record<string, string> = {}
    let hasErrors = false
    
    columns.forEach(column => {
      const value = formData[column.id] || ''
      const validation = validateValue(value, column)
      if (!validation.isValid) {
        errors[column.id] = validation.error || ''
        hasErrors = true
      }
    })
    
    setValidationErrors(errors)
    
    if (hasErrors) {
      toast.error('Please fix validation errors before adding the row')
      return
    }
    
    const hasData = Object.values(formData).some(value => value.trim())
    
    if (!hasData) {
      toast.error('Please enter at least one value')
      return
    }

    const newRow: DataRow = {
      id: Date.now().toString(),
      data: { ...formData },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isValid: true,
        errors: {}
      }
    }

    onAddRow(newRow)
    setFormData(columns.reduce((acc, col) => ({ ...acc, [col.id]: col.defaultValue || '' }), {}))
    setValidationErrors({})
    toast.success('Row added successfully')
  }

  const handleDeleteRow = (id: string) => {
    onDeleteRow(id)
    toast.success('Row deleted successfully')
  }

  const handleDownloadExcel = async () => {
    if (rows.length === 0) {
      toast.error('Please add at least one row of data')
      return
    }

    try {
      const exportOptions = {
        format: 'xlsx' as const,
        includeHeaders: true,
        sheetName: 'Sheet1',
        compression: true,
        dateFormat: 'MM/dd/yyyy',
        numberFormat: '#,##0.00',
        includeFormatting: true,
        freezeHeader: true,
        autoFilter: true
      }

      await exportToExcel(fileName, columns, rows, exportOptions)
      toast.success('Excel file downloaded successfully!')
    } catch (error) {
      console.error('Error generating Excel file:', error)
      toast.error('Failed to generate Excel file')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddRow()
    }
  }

  const handleSort = (columnId: string) => {
    setSortBy(prev => {
      if (prev?.columnId === columnId) {
        return prev.direction === 'asc' ? { columnId, direction: 'desc' } : null
      }
      return { columnId, direction: 'asc' }
    })
  }

  const handleRowSelect = (rowId: string) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    )
  }

  const handleSelectAll = () => {
    setSelectedRows(prev => 
      prev.length === filteredAndSortedRows.length ? [] : filteredAndSortedRows.map(row => row.id)
    )
  }

  const handleDeleteSelected = () => {
    selectedRows.forEach(rowId => onDeleteRow(rowId))
    setSelectedRows([])
    toast.success(`Deleted ${selectedRows.length} rows`)
  }

  // Filter and sort rows
  const filteredAndSortedRows = useMemo(() => {
    let filtered = rows.filter(row => {
      if (!searchTerm) return true
      return columns.some(col => {
        const value = row.data[col.id] || ''
        return value.toLowerCase().includes(searchTerm.toLowerCase())
      })
    })

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a.data[sortBy.columnId] || ''
        const bValue = b.data[sortBy.columnId] || ''
        const column = columns.find(col => col.id === sortBy.columnId)
        
        let comparison = 0
        if (column?.type === 'number' || column?.type === 'currency' || column?.type === 'percentage') {
          const aNum = parseFloat(aValue) || 0
          const bNum = parseFloat(bValue) || 0
          comparison = aNum - bNum
        } else if (column?.type === 'date') {
          const aDate = new Date(aValue).getTime() || 0
          const bDate = new Date(bValue).getTime() || 0
          comparison = aDate - bDate
        } else {
          comparison = aValue.localeCompare(bValue)
        }
        
        return sortBy.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [rows, searchTerm, sortBy, columns])

  const handleCellStyleEdit = (rowId: string, columnId: string) => {
    const row = rows.find(r => r.id === rowId)
    const currentStyle = row?.styles?.[columnId] || {}
    setCurrentCellStyle(currentStyle)
    setEditingCellStyle({ rowId, columnId, type: 'cell' })
    setShowCellStyleEditor(true)
  }

  const handleColumnStyleEdit = (columnId: string) => {
    const column = columns.find(c => c.id === columnId)
    const currentStyle = column?.style || {}
    setCurrentCellStyle(currentStyle)
    setEditingCellStyle({ columnId, type: 'column' })
    setShowCellStyleEditor(true)
  }

  const handleRowStyleEdit = (rowId: string) => {
    const row = rows.find(r => r.id === rowId)
    const currentStyle = row?.rowStyle || {}
    setCurrentCellStyle(currentStyle)
    setEditingCellStyle({ rowId, type: 'row' })
    setShowCellStyleEditor(true)
  }

  const handleStyleSave = (style: CellStyle) => {
    if (!editingCellStyle) return

    if (editingCellStyle.type === 'cell' && editingCellStyle.rowId && editingCellStyle.columnId) {
      const row = rows.find(r => r.id === editingCellStyle.rowId)
      if (row) {
        const updatedStyles = { ...row.styles, [editingCellStyle.columnId]: style }
        onUpdateRow(editingCellStyle.rowId, { styles: updatedStyles })
      }
    } else if (editingCellStyle.type === 'column' && editingCellStyle.columnId) {
      onUpdateColumn(editingCellStyle.columnId, { style })
    } else if (editingCellStyle.type === 'row' && editingCellStyle.rowId) {
      onUpdateRow(editingCellStyle.rowId, { rowStyle: style })
    }

    setShowCellStyleEditor(false)
    setEditingCellStyle(undefined)
    toast.success('Formatting applied successfully')
  }

  const applyQuickFormat = (type: 'bold' | 'italic' | 'underline') => {
    if (selectedRows.length === 0) {
      toast.error('Please select rows to format')
      return
    }

    selectedRows.forEach(rowId => {
      const row = rows.find(r => r.id === rowId)
      if (row) {
        const updatedRowStyle = { ...row.rowStyle, [type]: !row.rowStyle?.[type] }
        onUpdateRow(rowId, { rowStyle: updatedRowStyle })
      }
    })

    toast.success(`Applied ${type} formatting to ${selectedRows.length} rows`)
  }

  const getCellDisplayStyle = (row: DataRow, column: Column): React.CSSProperties => {
    const cellStyle = row.styles?.[column.id] || {}
    const columnStyle = column.style || {}
    const rowStyle = row.rowStyle || {}
    
    // Merge styles with priority: cell > row > column
    const mergedStyle = { ...columnStyle, ...rowStyle, ...cellStyle }
    
    return {
      fontWeight: mergedStyle.bold ? 'bold' : 'normal',
      fontStyle: mergedStyle.italic ? 'italic' : 'normal',
      textDecoration: mergedStyle.underline ? 'underline' : 'none',
      fontSize: mergedStyle.fontSize ? `${mergedStyle.fontSize}px` : undefined,
      fontFamily: mergedStyle.fontFamily || undefined,
      color: mergedStyle.textColor || undefined,
      backgroundColor: mergedStyle.backgroundColor || undefined,
      textAlign: mergedStyle.textAlign || 'left',
      borderTop: mergedStyle.border?.top ? `1px ${mergedStyle.border.top.style} ${mergedStyle.border.top.color}` : undefined,
      borderBottom: mergedStyle.border?.bottom ? `1px ${mergedStyle.border.bottom.style} ${mergedStyle.border.bottom.color}` : undefined,
      borderLeft: mergedStyle.border?.left ? `1px ${mergedStyle.border.left.style} ${mergedStyle.border.left.color}` : undefined,
      borderRight: mergedStyle.border?.right ? `1px ${mergedStyle.border.right.style} ${mergedStyle.border.right.color}` : undefined
    }
  }

  return (
    <>
      <ImportExportModal
        isOpen={showExport}
        mode="export"
        fileName={fileName}
        columns={columns}
        rows={selectedRows.length > 0 ? rows.filter(row => selectedRows.includes(row.id)) : rows}
        onClose={() => setShowExport(false)}
        onImport={() => {}}
      />

      <CellStyleEditor
        isOpen={showCellStyleEditor}
        style={currentCellStyle}
        onClose={() => {
          setShowCellStyleEditor(false)
          setEditingCellStyle(undefined)
        }}
        onSave={handleStyleSave}
        title={
          editingCellStyle?.type === 'cell' ? 'Format Cell' :
          editingCellStyle?.type === 'column' ? 'Format Column' :
          editingCellStyle?.type === 'row' ? 'Format Row' : 'Format'
        }
      />
      
      <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4"
    >
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-excel-green/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-excel-green" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Enter Data</h2>
          <p className="text-gray-400 text-sm sm:text-base">Add rows of data to your Excel sheet</p>
        </div>

        {/* Data Entry Form */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Add New Row</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
            {columns.map((column) => (
              <div key={column.id}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {column.name}
                </label>
                <input
                  type={column.type === 'email' ? 'email' : column.type === 'url' ? 'url' : column.type === 'date' ? 'date' : column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'number' : 'text'}
                  value={formData[column.id] || ''}
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full px-3 py-2 sm:py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none transition-all text-sm sm:text-base ${
                    validationErrors[column.id] ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder={column.defaultValue || `Enter ${column.name.toLowerCase()}`}
                  required={column.required}
                  min={column.validation?.min}
                  max={column.validation?.max}
                  pattern={column.validation?.pattern}
                />
                {validationErrors[column.id] && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors[column.id]}</p>
                )}
                {column.validation?.options && (
                  <datalist id={`${column.id}-options`}>
                    {column.validation.options.map(option => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                )}
              </div>
            ))}
          </div>
          
          <motion.button
            onClick={handleAddRow}
            className="bg-excel-green hover:bg-excel-green-dark text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Add Row
          </motion.button>
          
          <p className="text-xs text-gray-500 mt-2">
            <span className="hidden sm:inline">Tip: Press Ctrl+Enter to quickly add a row</span>
            <span className="sm:hidden">Ctrl+Enter to add row</span>
          </p>
        </div>

        {/* Data Preview Table */}
        {rows.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <h3 className="text-base sm:text-lg font-semibold">
                <span className="hidden sm:inline">Data Preview ({filteredAndSortedRows.length} of {rows.length} rows)</span>
                <span className="sm:hidden">Data ({filteredAndSortedRows.length}/{rows.length})</span>
                {selectedRows.length > 0 && (
                  <span className="text-sm text-excel-green"> • {selectedRows.length} selected</span>
                )}
              </h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search rows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none text-sm"
                  />
                </div>
                
                {/* Formatting Toolbar */}
                {selectedRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => applyQuickFormat('bold')}
                        className="p-1.5 hover:bg-gray-600 rounded text-sm"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => applyQuickFormat('italic')}
                        className="p-1.5 hover:bg-gray-600 rounded text-sm"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => applyQuickFormat('underline')}
                        className="p-1.5 hover:bg-gray-600 rounded text-sm"
                        title="Underline"
                      >
                        <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleDeleteSelected}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete Selected</span>
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto max-h-60 sm:max-h-80 border border-gray-600 rounded-lg">
              <table className="w-full text-xs sm:text-sm min-w-full">
                <thead className="bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 text-center font-medium w-8 sm:w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === filteredAndSortedRows.length && filteredAndSortedRows.length > 0}
                        onChange={handleSelectAll}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-excel-green bg-gray-600 border-gray-500 rounded focus:ring-excel-green focus:ring-2"
                      />
                    </th>
                    <th className="px-2 sm:px-3 py-2 text-left font-medium w-8 sm:w-12 text-xs sm:text-sm">#</th>
                    {columns.map((column) => (
                      <th key={column.id} className="px-2 sm:px-3 py-2 text-left font-medium group relative min-w-24 sm:min-w-32">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleSort(column.id)}
                            className="flex items-center gap-1 hover:text-excel-green transition-colors text-xs sm:text-sm"
                          >
                            <span className="truncate max-w-16 sm:max-w-24">{column.name}</span>
                            {column.required && <span className="text-red-400">*</span>}
                            {sortBy?.columnId === column.id && (
                              sortBy.direction === 'asc' ? 
                                <SortAsc className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                                <SortDesc className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleColumnStyleEdit(column.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                            title="Format Column"
                          >
                            <Palette className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 font-normal hidden sm:block">
                          {column.type}
                        </div>
                      </th>
                    ))}
                    <th className="px-2 sm:px-3 py-2 text-center font-medium w-12 sm:w-16 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Actions</span>
                      <span className="sm:hidden">Act</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-t border-gray-600 hover:bg-gray-700/50 group ${
                        selectedRows.includes(row.id) ? 'bg-excel-green/10' : ''
                      }`}
                    >
                      <td className="px-2 sm:px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-excel-green bg-gray-600 border-gray-500 rounded focus:ring-excel-green focus:ring-2"
                        />
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-gray-400 relative text-xs sm:text-sm">
                        {index + 1}
                        <button
                          onClick={() => handleRowStyleEdit(row.id)}
                          className="absolute right-0.5 sm:right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 sm:p-1 hover:bg-gray-600 rounded transition-all"
                          title="Format Row"
                        >
                          <Type className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </td>
                      {columns.map((column) => {
                        const value = row.data[column.id] || ''
                        const formattedValue = formatValue(value, column)
                        const validation = validateValue(value, column)
                        const cellStyle = getCellDisplayStyle(row, column)
                        
                        return (
                          <td 
                            key={column.id} 
                            className="px-2 sm:px-3 py-2 relative group/cell cursor-pointer text-xs sm:text-sm"
                            style={cellStyle}
                            onDoubleClick={() => handleCellStyleEdit(row.id, column.id)}
                          >
                            <div className={`truncate max-w-20 sm:max-w-32 ${!validation.isValid ? 'text-red-400' : ''}`} title={formattedValue}>
                              {formattedValue || '-'}
                            </div>
                            {!validation.isValid && (
                              <div className="text-xs text-red-400 mt-1 hidden sm:block">
                                {validation.error}
                              </div>
                            )}
                            <button
                              onClick={() => handleCellStyleEdit(row.id, column.id)}
                              className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 opacity-0 group-hover/cell:opacity-100 p-0.5 sm:p-1 hover:bg-gray-600 rounded transition-all"
                              title="Format Cell"
                            >
                              <Palette className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-2 sm:px-3 py-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation and Download */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            onClick={onPrev}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </motion.button>
          
          <div className="flex gap-2 sm:gap-3 flex-1">
            <motion.button
              onClick={handleDownloadExcel}
              className="flex-1 sm:flex-none bg-excel-green hover:bg-excel-green-dark text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Quick Excel</span>
              <span className="sm:hidden">Excel</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowExport(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileDown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Advanced Export</span>
              <span className="sm:hidden">Export</span>
              {selectedRows.length > 0 && (
                <span className="hidden sm:inline"> ({selectedRows.length})</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  )
}