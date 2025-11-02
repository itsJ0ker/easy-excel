import * as XLSX from 'xlsx';
import type { Column, DataRow, ImportOptions } from '../types';

export const importFromFile = async (
  file: File,
  options: ImportOptions
): Promise<{ columns: Column[]; rows: DataRow[] }> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  switch (fileExtension) {
    case 'xlsx':
    case 'xls':
      return importFromExcel(file, options);
    case 'csv':
      return importFromCSV(file, options);
    case 'json':
      return importFromJSON(file);
    default:
      throw new Error('Unsupported file format');
  }
};

const importFromExcel = async (
  file: File,
  options: ImportOptions
): Promise<{ columns: Column[]; rows: DataRow[] }> => {
  console.log('🔍 Starting Excel import for file:', file.name);
  console.log('📋 Import options:', options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('📖 File read successfully, processing...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        console.log('📊 Data buffer size:', data.length);
        
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('📚 Workbook loaded, sheets:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log('📄 Using sheet:', sheetName);
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        console.log('🔢 Raw JSON data rows:', jsonData.length);
        console.log('📝 First 3 rows of raw data:', jsonData.slice(0, 3));

        // Skip rows if specified
        const dataRows = jsonData.slice(options.skipRows);
        console.log('⏭️ After skipping rows:', dataRows.length);
        
        let columns: Column[] = [];
        let rows: DataRow[] = [];

        if (dataRows.length > 0) {
          console.log('🔍 Processing data rows...');
          
          // Filter out completely empty rows
          const nonEmptyRows = dataRows.filter(row => 
            row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '')
          );
          console.log('✅ Non-empty rows found:', nonEmptyRows.length);
          console.log('📝 Sample non-empty rows:', nonEmptyRows.slice(0, 2));

          if (nonEmptyRows.length > 0) {
            // Extract headers
            const headerRow = options.hasHeaders ? nonEmptyRows[0] : null;
            const dataStartIndex = options.hasHeaders ? 1 : 0;
            console.log('📋 Header row:', headerRow);
            console.log('🔢 Data start index:', dataStartIndex);

            // Create columns
            const maxColumns = Math.max(...nonEmptyRows.map(row => row ? row.length : 0));
            console.log('📊 Max columns detected:', maxColumns);
            
            columns = Array.from({ length: maxColumns }, (_, index) => ({
              id: `col_${index}`,
              name: (headerRow?.[index]?.toString() || `Column ${index + 1}`).trim(),
              type: 'text' as const,
              required: false
            }));
            console.log('🏗️ Created columns:', columns);

            // Create rows
            const dataRowsToProcess = nonEmptyRows.slice(dataStartIndex);
            console.log('📝 Data rows to process:', dataRowsToProcess.length);
            
            rows = dataRowsToProcess.map((row, index) => ({
              id: `row_${index}`,
              data: columns.reduce((acc, col, colIndex) => {
                const cellValue = row[colIndex];
                acc[col.id] = cellValue !== null && cellValue !== undefined ? cellValue.toString().trim() : '';
                return acc;
              }, {} as Record<string, string>),
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                isValid: true,
                errors: {}
              }
            }));
            console.log('🎯 Created rows:', rows.length);
            console.log('📝 Sample row data:', rows[0]);
          } else {
            console.log('❌ No non-empty rows found');
          }
        } else {
          console.log('❌ No data rows found');
        }

        console.log('✅ Import completed successfully');
        console.log('📊 Final result - Columns:', columns.length, 'Rows:', rows.length);
        resolve({ columns, rows });
      } catch (error) {
        console.error('❌ Excel import error:', error);
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    reader.onerror = (error) => {
      console.error('❌ File read error:', error);
      reject(new Error('Failed to read file'));
    };
    reader.readAsArrayBuffer(file);
  });
};

const importFromCSV = async (
  file: File,
  options: ImportOptions
): Promise<{ columns: Column[]; rows: DataRow[] }> => {
  console.log('🔍 Starting CSV import for file:', file.name);
  console.log('📋 Import options:', options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip rows if specified
        const dataLines = lines.slice(options.skipRows);
        
        let columns: Column[] = [];
        let rows: DataRow[] = [];

        if (dataLines.length > 0) {
          // Parse CSV with custom delimiter
          const parseCSVLine = (line: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === options.delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          // Filter out empty lines
          const nonEmptyLines = dataLines.filter(line => line.trim() !== '');
          
          if (nonEmptyLines.length > 0) {
            const headerRow = options.hasHeaders ? parseCSVLine(nonEmptyLines[0]) : null;
            const dataStartIndex = options.hasHeaders ? 1 : 0;

            // Create columns
            const firstDataRow = parseCSVLine(nonEmptyLines[dataStartIndex] || nonEmptyLines[0]);
            columns = firstDataRow.map((_, index) => ({
              id: `col_${index}`,
              name: (headerRow?.[index] || `Column ${index + 1}`).trim(),
              type: 'text' as const,
              required: false
            }));

            // Create rows
            const dataLinesToProcess = nonEmptyLines.slice(dataStartIndex);
            rows = dataLinesToProcess.map((line, index) => {
              const rowData = parseCSVLine(line);
              return {
                id: `row_${index}`,
                data: columns.reduce((acc, col, colIndex) => {
                  acc[col.id] = (rowData[colIndex] || '').trim();
                  return acc;
                }, {} as Record<string, string>),
                metadata: {
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  isValid: true,
                  errors: {}
                }
              };
            });
          }
        }

        resolve({ columns, rows });
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, options.encoding);
  });
};

const importFromJSON = async (file: File): Promise<{ columns: Column[]; rows: DataRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON must be an array of objects');
        }

        let columns: Column[] = [];
        let rows: DataRow[] = [];

        if (jsonData.length > 0) {
          // Extract column names from first object
          const firstObject = jsonData[0];
          const columnNames = Object.keys(firstObject);
          
          columns = columnNames.map((name, index) => ({
            id: `col_${index}`,
            name,
            type: 'text' as const,
            required: false
          }));

          // Create rows
          rows = jsonData.map((obj, index) => ({
            id: `row_${index}`,
            data: columns.reduce((acc, col) => {
              acc[col.id] = obj[col.name]?.toString() || '';
              return acc;
            }, {} as Record<string, string>),
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              isValid: true,
              errors: {}
            }
          }));
        }

        resolve({ columns, rows });
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};