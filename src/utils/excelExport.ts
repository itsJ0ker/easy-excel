import ExcelJS from 'exceljs';
import type { Column, DataRow, ExportOptions, CellStyle } from '../types';

export const exportToExcelWithFormatting = async (
  fileName: string,
  columns: Column[],
  rows: DataRow[],
  options: ExportOptions
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

  // Set workbook properties
  workbook.creator = 'Easy Excel';
  workbook.lastModifiedBy = 'Easy Excel';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Set column widths and headers
  const excelColumns = columns.map((col) => ({
    header: col.name,
    key: col.id,
    width: col.width || 15,
    style: convertToExcelStyle(col.style || {})
  }));

  worksheet.columns = excelColumns;

  // Apply header formatting if enabled
  if (options.includeHeaders && options.includeFormatting) {
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const column = columns[colNumber - 1];
      const headerStyle: CellStyle = {
        bold: true,
        backgroundColor: '#4472C4',
        textColor: '#FFFFFF',
        textAlign: 'center',
        border: {
          top: { style: 'thin', color: '#000000' },
          bottom: { style: 'thin', color: '#000000' },
          left: { style: 'thin', color: '#000000' },
          right: { style: 'thin', color: '#000000' }
        },
        ...column?.style
      };
      
      applyCellStyle(cell, headerStyle);
    });
    headerRow.commit();
  }

  // Add data rows
  rows.forEach((row) => {
    const rowData: Record<string, any> = {};
    
    columns.forEach(column => {
      const value = row.data[column.id] || '';
      rowData[column.id] = formatValueForExcel(value, column);
    });

    const excelRow = worksheet.addRow(rowData);
    
    // Apply row-level formatting
    if (options.includeFormatting && row.rowStyle) {
      excelRow.eachCell((cell) => {
        applyCellStyle(cell, row.rowStyle!);
      });
    }

    // Apply cell-level formatting
    if (options.includeFormatting && row.styles) {
      columns.forEach((column, colIndex) => {
        const cellStyle = row.styles?.[column.id];
        if (cellStyle) {
          const cell = excelRow.getCell(colIndex + 1);
          applyCellStyle(cell, cellStyle);
        }
      });
    }

    // Apply column-level formatting
    if (options.includeFormatting) {
      columns.forEach((column, colIndex) => {
        if (column.style) {
          const cell = excelRow.getCell(colIndex + 1);
          applyCellStyle(cell, column.style);
        }
      });
    }
  });

  // Apply Excel features
  if (options.autoFilter && options.includeHeaders) {
    const lastColumn = String.fromCharCode(65 + columns.length - 1);
    const lastRow = rows.length + (options.includeHeaders ? 1 : 0);
    worksheet.autoFilter = `A1:${lastColumn}${lastRow}`;
  }

  if (options.freezeHeader && options.includeHeaders) {
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const applyCellStyle = (cell: ExcelJS.Cell, style: CellStyle) => {
  // Font styling
  const font: Partial<ExcelJS.Font> = {};
  if (style.bold) font.bold = true;
  if (style.italic) font.italic = true;
  if (style.underline) font.underline = true;
  if (style.fontSize) font.size = style.fontSize;
  if (style.fontFamily) font.name = style.fontFamily;
  if (style.textColor) font.color = { argb: style.textColor.replace('#', 'FF') };
  
  if (Object.keys(font).length > 0) {
    cell.font = font;
  }

  // Fill (background color)
  if (style.backgroundColor) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: style.backgroundColor.replace('#', 'FF') }
    };
  }

  // Alignment
  const alignment: Partial<ExcelJS.Alignment> = {};
  if (style.textAlign) alignment.horizontal = style.textAlign;
  if (style.verticalAlign) alignment.vertical = style.verticalAlign === 'middle' ? 'middle' : style.verticalAlign;
  alignment.wrapText = true;
  
  if (Object.keys(alignment).length > 0) {
    cell.alignment = alignment;
  }

  // Borders
  if (style.border) {
    const border: Partial<ExcelJS.Borders> = {};
    
    if (style.border.top) {
      border.top = {
        style: convertBorderStyle(style.border.top.style),
        color: { argb: style.border.top.color.replace('#', 'FF') }
      };
    }
    if (style.border.bottom) {
      border.bottom = {
        style: convertBorderStyle(style.border.bottom.style),
        color: { argb: style.border.bottom.color.replace('#', 'FF') }
      };
    }
    if (style.border.left) {
      border.left = {
        style: convertBorderStyle(style.border.left.style),
        color: { argb: style.border.left.color.replace('#', 'FF') }
      };
    }
    if (style.border.right) {
      border.right = {
        style: convertBorderStyle(style.border.right.style),
        color: { argb: style.border.right.color.replace('#', 'FF') }
      };
    }
    
    cell.border = border;
  }

  // Number format
  if (style.numberFormat) {
    cell.numFmt = style.numberFormat;
  }
};

const convertBorderStyle = (style: string): ExcelJS.BorderStyle => {
  switch (style) {
    case 'thin': return 'thin';
    case 'medium': return 'medium';
    case 'thick': return 'thick';
    case 'dotted': return 'dotted';
    case 'dashed': return 'dashed';
    default: return 'thin';
  }
};

const convertToExcelStyle = (style: CellStyle): Partial<ExcelJS.Style> => {
  const excelStyle: Partial<ExcelJS.Style> = {};
  
  // Font
  if (style.bold || style.italic || style.fontSize || style.fontFamily || style.textColor) {
    excelStyle.font = {};
    if (style.bold) excelStyle.font.bold = true;
    if (style.italic) excelStyle.font.italic = true;
    if (style.fontSize) excelStyle.font.size = style.fontSize;
    if (style.fontFamily) excelStyle.font.name = style.fontFamily;
    if (style.textColor) excelStyle.font.color = { argb: style.textColor.replace('#', 'FF') };
  }
  
  // Fill
  if (style.backgroundColor) {
    excelStyle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: style.backgroundColor.replace('#', 'FF') }
    };
  }
  
  // Alignment
  if (style.textAlign || style.verticalAlign) {
    excelStyle.alignment = {};
    if (style.textAlign) excelStyle.alignment.horizontal = style.textAlign;
    if (style.verticalAlign) excelStyle.alignment.vertical = style.verticalAlign === 'middle' ? 'middle' : style.verticalAlign;
    excelStyle.alignment.wrapText = true;
  }
  
  return excelStyle;
};

const formatValueForExcel = (value: string, column: Column): any => {
  if (!value.trim()) return value;

  switch (column.type) {
    case 'number':
    case 'currency':
    case 'percentage':
      const numValue = parseFloat(value);
      return !isNaN(numValue) ? numValue : value;
    
    case 'date':
      const dateValue = new Date(value);
      return !isNaN(dateValue.getTime()) ? dateValue : value;
    
    case 'boolean':
      const lowerValue = value.toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(lowerValue)) return true;
      if (['false', '0', 'no', 'n'].includes(lowerValue)) return false;
      return value;
    
    default:
      return value;
  }
};