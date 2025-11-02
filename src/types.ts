export type ColumnType = 'text' | 'number' | 'date' | 'email' | 'url' | 'phone' | 'currency' | 'percentage' | 'boolean';

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  border?: {
    top?: { style: string; color: string };
    bottom?: { style: string; color: string };
    left?: { style: string; color: string };
    right?: { style: string; color: string };
  };
  numberFormat?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  required: boolean;
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  format?: {
    currency?: string;
    dateFormat?: string;
    decimalPlaces?: number;
  };
  style?: CellStyle;
  width?: number;
}

export interface DataRow {
  id: string;
  data: Record<string, string>;
  styles?: Record<string, CellStyle>;
  rowStyle?: CellStyle;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    isValid: boolean;
    errors: Record<string, string>;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  category: string;
  icon: string;
}

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json' | 'pdf';
  includeHeaders: boolean;
  sheetName: string;
  password?: string;
  compression: boolean;
  dateFormat: string;
  numberFormat: string;
  includeFormatting: boolean;
  freezeHeader: boolean;
  autoFilter: boolean;
  pageSetup?: {
    orientation: 'portrait' | 'landscape';
    paperSize: string;
    margins: { top: number; bottom: number; left: number; right: number };
  };
}

export interface ImportOptions {
  hasHeaders: boolean;
  delimiter: string;
  encoding: string;
  skipRows: number;
}

export interface AppState {
  fileName: string;
  columns: Column[];
  rows: DataRow[];
  currentStep: number;
  templates: Template[];
  exportOptions: ExportOptions;
  importOptions: ImportOptions;
  filters: Record<string, string>;
  sortBy: { columnId: string; direction: 'asc' | 'desc' } | null;
  selectedRows: string[];
  history: {
    past: AppState[];
    present: AppState;
    future: AppState[];
  };
  settings: {
    theme: 'dark' | 'light' | 'auto';
    autoSave: boolean;
    showRowNumbers: boolean;
    pageSize: number;
    language: string;
  };
}