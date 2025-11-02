import type { Column } from '../types';

export const validateValue = (value: string, column: Column): { isValid: boolean; error?: string } => {
  if (column.required && !value.trim()) {
    return { isValid: false, error: `${column.name} is required` };
  }

  if (!value.trim()) {
    return { isValid: true };
  }

  switch (column.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }
      break;

    case 'phone':
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return { isValid: false, error: 'Invalid phone number format' };
      }
      break;

    case 'number':
    case 'currency':
    case 'percentage':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Must be a valid number' };
      }
      if (column.validation?.min !== undefined && numValue < column.validation.min) {
        return { isValid: false, error: `Must be at least ${column.validation.min}` };
      }
      if (column.validation?.max !== undefined && numValue > column.validation.max) {
        return { isValid: false, error: `Must be at most ${column.validation.max}` };
      }
      break;

    case 'date':
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
      }
      break;

    case 'boolean':
      const boolValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
      if (!boolValues.includes(value.toLowerCase())) {
        return { isValid: false, error: 'Must be true/false, yes/no, or 1/0' };
      }
      break;
  }

  if (column.validation?.pattern) {
    const regex = new RegExp(column.validation.pattern);
    if (!regex.test(value)) {
      return { isValid: false, error: 'Invalid format' };
    }
  }

  if (column.validation?.options && !column.validation.options.includes(value)) {
    return { isValid: false, error: `Must be one of: ${column.validation.options.join(', ')}` };
  }

  return { isValid: true };
};

export const formatValue = (value: string, column: Column): string => {
  if (!value.trim()) return value;

  switch (column.type) {
    case 'currency':
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const currency = column.format?.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: column.format?.decimalPlaces || 2
        }).format(numValue);
      }
      break;

    case 'percentage':
      const percentValue = parseFloat(value);
      if (!isNaN(percentValue)) {
        return `${percentValue}%`;
      }
      break;

    case 'date':
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        const format = column.format?.dateFormat || 'MM/dd/yyyy';
        return dateValue.toLocaleDateString();
      }
      break;

    case 'boolean':
      const lowerValue = value.toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(lowerValue)) return 'Yes';
      if (['false', '0', 'no', 'n'].includes(lowerValue)) return 'No';
      break;

    case 'phone':
      // Format phone number
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      break;
  }

  return value;
};