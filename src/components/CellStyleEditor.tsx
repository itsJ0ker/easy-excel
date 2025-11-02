import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Grid3X3
} from 'lucide-react';
import type { CellStyle } from '../types';

interface CellStyleEditorProps {
  isOpen: boolean;
  style: CellStyle;
  onClose: () => void;
  onSave: (style: CellStyle) => void;
  title?: string;
}

const fontFamilies = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 
  'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS'
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
  '#9999FF', '#993366', '#FFFFCC', '#CCFFFF', '#660066', '#FF8080', '#0066CC', '#CCCCFF',
  '#000080', '#FF00FF', '#FFFF00', '#00FFFF', '#800080', '#800000', '#008080', '#0000FF'
];

const borderStyles = [
  { value: 'none', label: 'None' },
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'dashed', label: 'Dashed' }
];

export default function CellStyleEditor({ 
  isOpen, 
  style, 
  onClose, 
  onSave, 
  title = 'Cell Formatting' 
}: CellStyleEditorProps) {
  const [currentStyle, setCurrentStyle] = useState<CellStyle>(style);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(currentStyle);
    onClose();
  };

  const updateStyle = (updates: Partial<CellStyle>) => {
    setCurrentStyle(prev => ({ ...prev, ...updates }));
  };

  const updateBorder = (side: 'top' | 'bottom' | 'left' | 'right', borderStyle: string, color: string) => {
    setCurrentStyle(prev => ({
      ...prev,
      border: {
        ...prev.border,
        [side]: { style: borderStyle, color }
      }
    }));
  };

  const setAllBorders = (borderStyle: string, color: string) => {
    setCurrentStyle(prev => ({
      ...prev,
      border: {
        top: { style: borderStyle, color },
        bottom: { style: borderStyle, color },
        left: { style: borderStyle, color },
        right: { style: borderStyle, color }
      }
    }));
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
        className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Font Formatting */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Font Formatting</h3>
              
              {/* Font Family & Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={currentStyle.fontFamily || 'Arial'}
                    onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={currentStyle.fontSize || 12}
                    onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}pt</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Style Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStyle({ bold: !currentStyle.bold })}
                    className={`p-2 rounded-lg border transition-colors ${
                      currentStyle.bold 
                        ? 'bg-excel-green border-excel-green text-white' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => updateStyle({ italic: !currentStyle.italic })}
                    className={`p-2 rounded-lg border transition-colors ${
                      currentStyle.italic 
                        ? 'bg-excel-green border-excel-green text-white' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => updateStyle({ underline: !currentStyle.underline })}
                    className={`p-2 rounded-lg border transition-colors ${
                      currentStyle.underline 
                        ? 'bg-excel-green border-excel-green text-white' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight }
                  ].map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateStyle({ textAlign: value as any })}
                      className={`p-2 rounded-lg border transition-colors ${
                        currentStyle.textAlign === value 
                          ? 'bg-excel-green border-excel-green text-white' 
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map(color => (
                      <button
                        key={`text-${color}`}
                        onClick={() => updateStyle({ textColor: color })}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          currentStyle.textColor === color 
                            ? 'border-white scale-110' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map(color => (
                      <button
                        key={`bg-${color}`}
                        onClick={() => updateStyle({ backgroundColor: color })}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          currentStyle.backgroundColor === color 
                            ? 'border-white scale-110' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Borders & Advanced */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Borders & Advanced</h3>
              
              {/* Border Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Borders
                </label>
                
                <div className="space-y-4">
                  {/* All Borders */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setAllBorders('thin', '#000000')}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      All Borders
                    </button>
                    
                    <select
                      onChange={(e) => {
                        if (e.target.value !== 'none') {
                          setAllBorders(e.target.value, currentStyle.border?.top?.color || '#000000');
                        }
                      }}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                    >
                      {borderStyles.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Individual Borders */}
                  <div className="grid grid-cols-2 gap-4">
                    {['top', 'bottom', 'left', 'right'].map(side => (
                      <div key={side} className="flex items-center gap-2">
                        <span className="text-sm capitalize w-12">{side}:</span>
                        <select
                          value={currentStyle.border?.[side as keyof typeof currentStyle.border]?.style || 'none'}
                          onChange={(e) => updateBorder(
                            side as any, 
                            e.target.value, 
                            currentStyle.border?.[side as keyof typeof currentStyle.border]?.color || '#000000'
                          )}
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                        >
                          {borderStyles.map(style => (
                            <option key={style.value} value={style.value}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Number Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number Format
                </label>
                <select
                  value={currentStyle.numberFormat || 'General'}
                  onChange={(e) => updateStyle({ numberFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-excel-green focus:border-transparent outline-none"
                >
                  <option value="General">General</option>
                  <option value="0">Number</option>
                  <option value="0.00">Number (2 decimals)</option>
                  <option value="#,##0">Number with commas</option>
                  <option value="#,##0.00">Number with commas (2 decimals)</option>
                  <option value="$#,##0.00">Currency</option>
                  <option value="0%">Percentage</option>
                  <option value="0.00%">Percentage (2 decimals)</option>
                  <option value="mm/dd/yyyy">Date</option>
                  <option value="dd/mm/yyyy">Date (DD/MM/YYYY)</option>
                  <option value="yyyy-mm-dd">Date (YYYY-MM-DD)</option>
                  <option value="h:mm AM/PM">Time</option>
                  <option value="@">Text</option>
                </select>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preview
                </label>
                <div 
                  className="p-4 border border-gray-600 rounded-lg bg-white text-black"
                  style={{
                    fontFamily: currentStyle.fontFamily || 'Arial',
                    fontSize: `${currentStyle.fontSize || 12}px`,
                    fontWeight: currentStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentStyle.italic ? 'italic' : 'normal',
                    textDecoration: currentStyle.underline ? 'underline' : 'none',
                    textAlign: currentStyle.textAlign || 'left',
                    color: currentStyle.textColor || '#000000',
                    backgroundColor: currentStyle.backgroundColor || 'transparent',
                    borderTop: currentStyle.border?.top ? `1px ${currentStyle.border.top.style} ${currentStyle.border.top.color}` : 'none',
                    borderBottom: currentStyle.border?.bottom ? `1px ${currentStyle.border.bottom.style} ${currentStyle.border.bottom.color}` : 'none',
                    borderLeft: currentStyle.border?.left ? `1px ${currentStyle.border.left.style} ${currentStyle.border.left.color}` : 'none',
                    borderRight: currentStyle.border?.right ? `1px ${currentStyle.border.right.style} ${currentStyle.border.right.color}` : 'none'
                  }}
                >
                  Sample Text 123.45
                </div>
              </div>
            </div>
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
            className="px-4 py-2 bg-excel-green hover:bg-excel-green-dark rounded-lg transition-colors"
          >
            Apply Formatting
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}