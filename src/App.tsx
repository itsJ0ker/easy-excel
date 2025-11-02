import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { FileText, RotateCcw } from 'lucide-react'
import { StepIndicator, Step1CreateFile, Step2AddColumns, Step3EnterData } from './components'
import type { Column, DataRow, Template } from './types'

function App() {
  const [fileName, setFileName] = useState('')
  const [columns, setColumns] = useState<Column[]>([])
  const [rows, setRows] = useState<DataRow[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const updateFileName = (newFileName: string) => {
    setFileName(newFileName)
  }

  const addColumn = (column: Column) => {
    setColumns(prev => [...prev, column])
  }

  const updateColumn = (id: string, updatedColumn: Partial<Column>) => {
    setColumns(prev => prev.map(col => col.id === id ? { ...col, ...updatedColumn } : col))
  }

  const deleteColumn = (id: string) => {
    setColumns(prev => prev.filter(col => col.id !== id))
    setRows(prev => prev.map(row => ({
      ...row,
      data: Object.fromEntries(
        Object.entries(row.data).filter(([key]) => key !== id)
      )
    })))
  }

  const addRow = (row: DataRow) => {
    setRows(prev => [...prev, row])
  }

  const updateRow = (id: string, updates: Partial<DataRow>) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, ...updates } : row))
  }

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id))
  }

  const nextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const reset = () => {
    setFileName('')
    setColumns([])
    setRows([])
    setCurrentStep(1)
  }

  const handleSelectTemplate = (template: Template) => {
    setFileName(template.name)
    setColumns(template.columns)
    setRows([])
  }

  const handleImportData = (importedColumns: Column[], importedRows: DataRow[]) => {
    setColumns(importedColumns)
    setRows(importedRows)
    setCurrentStep(3) // Skip to data entry step

    // Set a default filename if not set
    if (!fileName) {
      setFileName('Imported Data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          },
          duration: 3000
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-excel-green" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Easy Excel</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-4">Create Excel Sheets Instantly, Right from Your Browser</p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Reset Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1CreateFile
              fileName={fileName}
              onFileNameChange={updateFileName}
              onNext={nextStep}
              onSelectTemplate={handleSelectTemplate}
              onImportData={handleImportData}
            />
          )}

          {currentStep === 2 && (
            <Step2AddColumns
              columns={columns}
              onAddColumn={addColumn}
              onUpdateColumn={(id, name) => updateColumn(id, { name })}
              onDeleteColumn={deleteColumn}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3EnterData
              fileName={fileName}
              columns={columns}
              rows={rows}
              onAddRow={addRow}
              onDeleteRow={deleteRow}
              onUpdateRow={updateRow}
              onUpdateColumn={updateColumn}
              onPrev={prevStep}
            />
          )}

          {/* Fallback for invalid steps */}
          {currentStep > 3 && (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">Invalid step: {currentStep}</p>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-excel-green hover:bg-excel-green-dark text-white px-6 py-2 rounded-lg"
              >
                Go to Step 3
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App