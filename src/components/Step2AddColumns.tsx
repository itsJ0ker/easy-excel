import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ArrowRight, ArrowLeft, Columns, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdvancedColumnEditor } from './'
import type { Column } from '../types'

interface Step2AddColumnsProps {
  columns: Column[]
  onAddColumn: (column: Column) => void
  onUpdateColumn: (id: string, name: string) => void
  onDeleteColumn: (id: string) => void
  onNext: () => void
  onPrev: () => void
}

export default function Step2AddColumns({ 
  columns, 
  onAddColumn, 
  onUpdateColumn, 
  onDeleteColumn, 
  onNext, 
  onPrev 
}: Step2AddColumnsProps) {
  const [columnName, setColumnName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false)
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)

  const handleAddColumn = () => {
    if (!columnName.trim()) {
      toast.error('Please enter a column name')
      return
    }

    if (columns.some(col => col.name.toLowerCase() === columnName.trim().toLowerCase())) {
      toast.error('Column name already exists')
      return
    }

    const newColumn: Column = {
      id: Date.now().toString(),
      name: columnName.trim(),
      type: 'text',
      required: false
    }

    onAddColumn(newColumn)
    setColumnName('')
    toast.success('Column added successfully')
  }

  const handleEditColumn = (column: Column) => {
    setEditingId(column.id)
    setEditingName(column.name)
  }

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast.error('Column name cannot be empty')
      return
    }

    if (columns.some(col => col.id !== editingId && col.name.toLowerCase() === editingName.trim().toLowerCase())) {
      toast.error('Column name already exists')
      return
    }

    onUpdateColumn(editingId!, editingName.trim())
    setEditingId(null)
    setEditingName('')
    toast.success('Column updated successfully')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDeleteColumn = (id: string) => {
    onDeleteColumn(id)
    toast.success('Column deleted successfully')
  }

  const handleNext = () => {
    if (columns.length === 0) {
      toast.error('Please add at least one column')
      return
    }
    onNext()
  }

  const handleAdvancedEdit = (column: Column) => {
    setEditingColumn(column)
    setShowAdvancedEditor(true)
  }

  const handleAdvancedSave = (updatedColumn: Column) => {
    if (editingColumn) {
      onUpdateColumn(editingColumn.id, updatedColumn.name)
      // Note: Full column update would need to be implemented in parent component
    } else {
      // Adding new column
      const newColumn = { ...updatedColumn, id: Date.now().toString() }
      onAddColumn(newColumn)
    }
    setEditingColumn(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        handleSaveEdit()
      } else {
        handleAddColumn()
      }
    }
    if (e.key === 'Escape' && editingId) {
      handleCancelEdit()
    }
  }

  return (
    <>
      <AdvancedColumnEditor
        isOpen={showAdvancedEditor}
        column={editingColumn}
        onClose={() => {
          setShowAdvancedEditor(false)
          setEditingColumn(null)
        }}
        onSave={handleAdvancedSave}
      />
      
      <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4"
    >
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-excel-green/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Columns className="w-6 h-6 sm:w-8 sm:h-8 text-excel-green" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Add Columns</h2>
          <p className="text-gray-400 text-sm sm:text-base">Define the structure of your Excel sheet</p>
        </div>

        {/* Add Column Input */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter column name"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none transition-all text-sm sm:text-base"
            />
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                onClick={handleAddColumn}
                className="flex-1 sm:flex-none bg-excel-green hover:bg-excel-green-dark text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Column</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setEditingColumn(null)
                  setShowAdvancedEditor(true)
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Advanced</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Columns List */}
        {columns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Columns ({columns.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {columns.map((column, index) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-excel-green/20 rounded-full flex items-center justify-center text-sm font-semibold text-excel-green">
                    {index + 1}
                  </div>
                  
                  {editingId === column.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 font-medium">{column.name}</span>
                  )}
                  
                  <div className="flex gap-2">
                    {editingId === column.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-excel-green hover:bg-excel-green/20 rounded transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-400 hover:bg-gray-600 rounded transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAdvancedEdit(column)}
                          className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded transition-colors"
                          title="Advanced Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditColumn(column)}
                          className="p-1 text-gray-400 hover:text-excel-green hover:bg-excel-green/20 rounded transition-colors"
                          title="Quick Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={onPrev}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            className="flex-1 bg-excel-green hover:bg-excel-green-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Proceed to Data Entry
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
    </>
  )
}