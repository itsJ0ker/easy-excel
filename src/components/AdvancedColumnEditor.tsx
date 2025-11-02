import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Column, ColumnType } from '../types';

interface AdvancedColumnEditorProps {
  isOpen: boolean;
  column: Column | null;
  onClose: () => void;
  onSave: (column: Column) => void;
}

const columnTypes: { value: ColumnType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Any text content' },
  { value: 'number', label: 'Number', description: 'Numeric values' },
  { value: 'date', label: 'Date', description: 'Date values' },
  { value: 'email', label: 'Email', description: 'Email addresses' },
  { value: 'url', label: 'URL', description: 'Web addresses' },
  { value: 'phone', label: 'Phone', description: 'Phone numbers' },
  { value: 'currency', label: 'Currency', description: 'Monetary values' },
  { value: 'percentage', label: 'Percentage', description: 'Percentage values' },
  { value: 'boolean', label: 'Yes/No', description: 'True/false values' }
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
const dateFormats = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MMM dd, yyyy'];

export default function AdvancedColumnEditor({ isOpen, column, onClose, onSave }: AdvancedColumnEditorProps) {
  const [formData, setFormData] = useState<Column>(() => 
    column || {
      id: '',
      name: '',
      type: 'text',
      required: false,
      defaultValue: '',
      validation: {},
      format: {}
    }
  );

  const [validationOptions, setValidationOptions] = useState<string[]>(
    formData.validation?.options || []
  );
  const [newOption, setNewOption] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedColumn = {
      ...formData,
      validation: {
        ...formData.validation,
        options: validationOptions.length > 0 ? validationOptions : undefined
      }
    };
    onSave(updatedColumn);
    onClose();
  };

  const addValidationOption = () => {
    if (newOption.trim() && !validationOptions.includes(newOption.trim())) {
      setValidationOptions([...validationOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeValidationOption = (option: string) => {
    setValidationOptions(validationOptions.filter(opt => opt !== option));
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
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {column ? 'Edit Column' : 'Add Column'}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Column Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                  placeholder="Enter column name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ColumnType })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                >
                  {columnTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Value
                </label>
                <input
                  type="text"
                  value={formData.defaultValue || ''}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                  placeholder="Optional default value"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="w-4 h-4 text-excel-green bg-gray-700 border-gray-600 rounded focus:ring-excel-green focus:ring-2"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-300">
                  Required field
                </label>
              </div>
            </div>

            {/* Validation Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Validation Rules</h3>
              
              {(formData.type === 'number' || formData.type === 'currency' || formData.type === 'percentage') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Value
                    </label>
                    <input
                      type="number"
                      value={formData.validation?.min || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation: { ...formData.validation, min: e.target.value ? parseFloat(e.target.value) : undefined }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Value
                    </label>
                    <input
                      type="number"
                      value={formData.validation?.max || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation: { ...formData.validation, max: e.target.value ? parseFloat(e.target.value) : undefined }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Pattern (Regex)
                </label>
                <input
                  type="text"
                  value={formData.validation?.pattern || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: { ...formData.validation, pattern: e.target.value || undefined }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                  placeholder="e.g., ^[A-Z]{2,3}$"
                />
              </div>

              {/* Dropdown Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dropdown Options
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addValidationOption()}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    placeholder="Add option"
                  />
                  <button
                    onClick={addValidationOption}
                    className="px-3 py-2 bg-excel-green hover:bg-excel-green-dark rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {validationOptions.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {validationOptions.map((option, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded">
                        <span className="text-sm">{option}</span>
                        <button
                          onClick={() => removeValidationOption(option)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Formatting Options */}
            {(formData.type === 'currency' || formData.type === 'date') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Formatting</h3>
                
                {formData.type === 'currency' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.format?.currency || 'USD'}
                        onChange={(e) => setFormData({
                          ...formData,
                          format: { ...formData.format, currency: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Decimal Places
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={formData.format?.decimalPlaces || 2}
                        onChange={(e) => setFormData({
                          ...formData,
                          format: { ...formData.format, decimalPlaces: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'date' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={formData.format?.dateFormat || 'MM/dd/yyyy'}
                      onChange={(e) => setFormData({
                        ...formData,
                        format: { ...formData.format, dateFormat: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    >
                      {dateFormats.map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-excel-green hover:bg-excel-green-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save Column
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}