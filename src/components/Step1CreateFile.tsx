import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Layers, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { TemplateSelector, ImportExportModal } from './'
import type { Template as TemplateType, Column, DataRow } from '../types'

interface Step1CreateFileProps {
  fileName: string
  onFileNameChange: (fileName: string) => void
  onNext: () => void
  onSelectTemplate?: (template: TemplateType) => void
  onImportData?: (columns: Column[], rows: DataRow[]) => void
}

export default function Step1CreateFile({ fileName, onFileNameChange, onNext, onSelectTemplate, onImportData }: Step1CreateFileProps) {
  const [inputValue, setInputValue] = useState(fileName)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const handleNext = () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a file name')
      return
    }
    onFileNameChange(inputValue.trim())
    onNext()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  const handleTemplateSelect = (template: TemplateType) => {
    onSelectTemplate?.(template)
    setShowTemplates(false)
    onNext()
  }

  const handleImportData = (columns: Column[], rows: DataRow[]) => {
    onImportData?.(columns, rows)
    setShowImport(false)
    // Don't call onNext() here - the parent component handles step navigation for imports
  }

  return (
    <>
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
      
      <ImportExportModal
        isOpen={showImport}
        mode="import"
        fileName=""
        columns={[]}
        rows={[]}
        onClose={() => setShowImport(false)}
        onImport={handleImportData}
      />
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto px-4"
    >
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-excel-green/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-excel-green" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Create Your Excel File</h2>
          <p className="text-gray-400 text-sm sm:text-base">Enter a name for your Excel file</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-300 mb-2">
              File Name
            </label>
            <input
              id="fileName"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="My Excel File"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              .xlsx extension will be added automatically
            </p>
          </div>

          <motion.button
            onClick={handleNext}
            className="w-full bg-excel-green hover:bg-excel-green-dark text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group mb-3 sm:mb-4 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start from Scratch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="text-center text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">or</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <motion.button
              onClick={() => setShowTemplates(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Layers className="w-4 h-4" />
              Use Template
            </motion.button>

            <motion.button
              onClick={() => setShowImport(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-4 h-4" />
              Import File
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  )
}