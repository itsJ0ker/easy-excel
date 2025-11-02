import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Download, FileText, Database, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Column, DataRow, ExportOptions, ImportOptions } from '../types';
import { importFromFile } from '../utils/import';
import { exportToExcel, exportToCSV, exportToJSON } from '../utils/export';

interface ImportExportModalProps {
  isOpen: boolean;
  mode: 'import' | 'export';
  fileName: string;
  columns: Column[];
  rows: DataRow[];
  onClose: () => void;
  onImport: (columns: Column[], rows: DataRow[]) => void;
}

export default function ImportExportModal({
  isOpen,
  mode,
  fileName,
  columns,
  rows,
  onClose,
  onImport
}: ImportExportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'xlsx',
    includeHeaders: true,
    sheetName: 'Sheet1',
    compression: true,
    dateFormat: 'MM/dd/yyyy',
    numberFormat: '#,##0.00',
    includeFormatting: true,
    freezeHeader: true,
    autoFilter: true
  });

  const [importOptions, setImportOptions] = useState<ImportOptions>({
    hasHeaders: true,
    delimiter: ',',
    encoding: 'utf-8',
    skipRows: 0
  });

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const { columns: importedColumns, rows: importedRows } = await importFromFile(file, importOptions);
      onImport(importedColumns, importedRows);
      toast.success(`Successfully imported ${importedRows.length} rows with ${importedColumns.length} columns`);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import file');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExport = async () => {
    if (rows.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      switch (exportOptions.format) {
        case 'xlsx':
          await exportToExcel(fileName, columns, rows, exportOptions);
          break;
        case 'csv':
          exportToCSV(fileName, columns, rows, exportOptions);
          break;
        case 'json':
          exportToJSON(fileName, columns, rows, exportOptions);
          break;
      }
      toast.success('File exported successfully!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export file');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              {mode === 'import' ? (
                <>
                  <Upload className="w-5 h-5" />
                  Import Data
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export Data
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {mode === 'import' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Import Options</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      File Encoding
                    </label>
                    <select
                      value={importOptions.encoding}
                      onChange={(e) => setImportOptions({ ...importOptions, encoding: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    >
                      <option value="utf-8">UTF-8</option>
                      <option value="latin1">Latin-1</option>
                      <option value="ascii">ASCII</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CSV Delimiter
                    </label>
                    <select
                      value={importOptions.delimiter}
                      onChange={(e) => setImportOptions({ ...importOptions, delimiter: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                      <option value="|">Pipe (|)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skip Rows
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={importOptions.skipRows}
                      onChange={(e) => setImportOptions({ ...importOptions, skipRows: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="hasHeaders"
                      checked={importOptions.hasHeaders}
                      onChange={(e) => setImportOptions({ ...importOptions, hasHeaders: e.target.checked })}
                      className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                    />
                    <label htmlFor="hasHeaders" className="ml-2 text-sm text-gray-300">
                      First row contains headers
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Select File</h3>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <FileText className="w-8 h-8 text-excel-green" />
                      <Database className="w-8 h-8 text-blue-400" />
                      <Code className="w-8 h-8 text-yellow-400" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium mb-2">Choose a file to import</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Supports Excel (.xlsx, .xls), CSV (.csv), and JSON (.json) files
                      </p>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="bg-excel-green hover:bg-excel-green-dark disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        {isProcessing ? 'Processing...' : 'Choose File'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Format</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { value: 'xlsx', label: 'Excel', icon: FileText, description: 'Microsoft Excel format' },
                    { value: 'csv', label: 'CSV', icon: Database, description: 'Comma-separated values' },
                    { value: 'json', label: 'JSON', icon: Code, description: 'JavaScript Object Notation' }
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportOptions({ ...exportOptions, format: format.value as any })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        exportOptions.format === format.value
                          ? 'border-excel-green bg-excel-green/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <format.icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">{format.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeHeaders"
                      checked={exportOptions.includeHeaders}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeHeaders: e.target.checked })}
                      className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                    />
                    <label htmlFor="includeHeaders" className="ml-2 text-sm text-gray-300">
                      Include column headers
                    </label>
                  </div>

                  {exportOptions.format === 'xlsx' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Sheet Name
                        </label>
                        <input
                          type="text"
                          value={exportOptions.sheetName}
                          onChange={(e) => setExportOptions({ ...exportOptions, sheetName: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="compression"
                          checked={exportOptions.compression}
                          onChange={(e) => setExportOptions({ ...exportOptions, compression: e.target.checked })}
                          className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                        />
                        <label htmlFor="compression" className="ml-2 text-sm text-gray-300">
                          Enable compression
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeFormatting"
                          checked={exportOptions.includeFormatting}
                          onChange={(e) => setExportOptions({ ...exportOptions, includeFormatting: e.target.checked })}
                          className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                        />
                        <label htmlFor="includeFormatting" className="ml-2 text-sm text-gray-300">
                          Include cell formatting
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="freezeHeader"
                          checked={exportOptions.freezeHeader}
                          onChange={(e) => setExportOptions({ ...exportOptions, freezeHeader: e.target.checked })}
                          className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                        />
                        <label htmlFor="freezeHeader" className="ml-2 text-sm text-gray-300">
                          Freeze header row
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoFilter"
                          checked={exportOptions.autoFilter}
                          onChange={(e) => setExportOptions({ ...exportOptions, autoFilter: e.target.checked })}
                          className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                        />
                        <label htmlFor="autoFilter" className="ml-2 text-sm text-gray-300">
                          Enable auto filter
                        </label>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select
                        value={exportOptions.dateFormat}
                        onChange={(e) => setExportOptions({ ...exportOptions, dateFormat: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                      >
                        <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                        <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                        <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                        <option value="MMM dd, yyyy">MMM dd, yyyy</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Number Format
                      </label>
                      <select
                        value={exportOptions.numberFormat}
                        onChange={(e) => setExportOptions({ ...exportOptions, numberFormat: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                      >
                        <option value="#,##0.00">#,##0.00</option>
                        <option value="#,##0">#,##0</option>
                        <option value="0.00">0.00</option>
                        <option value="0">0</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Export Summary</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Columns: {columns.length}</div>
                  <div>Rows: {rows.length}</div>
                  <div>Format: {exportOptions.format.toUpperCase()}</div>
                  <div>Headers: {exportOptions.includeHeaders ? 'Included' : 'Excluded'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {mode === 'export' && (
            <button
              onClick={handleExport}
              disabled={rows.length === 0}
              className="px-4 py-2 bg-excel-green hover:bg-excel-green-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Export Data
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}