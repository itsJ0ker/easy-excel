import type { Column, DataRow } from '../types';

export const createTestData = (): { columns: Column[]; rows: DataRow[] } => {
  const columns: Column[] = [
    { id: 'col_0', name: 'Name', type: 'text', required: false },
    { id: 'col_1', name: 'Email', type: 'email', required: false },
    { id: 'col_2', name: 'Phone', type: 'phone', required: false },
    { id: 'col_3', name: 'Department', type: 'text', required: false }
  ];

  const rows: DataRow[] = [
    {
      id: 'row_0',
      data: {
        col_0: 'John Doe',
        col_1: 'john.doe@email.com',
        col_2: '555-0123',
        col_3: 'Engineering'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isValid: true,
        errors: {}
      }
    },
    {
      id: 'row_1',
      data: {
        col_0: 'Jane Smith',
        col_1: 'jane.smith@email.com',
        col_2: '555-0124',
        col_3: 'Marketing'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isValid: true,
        errors: {}
      }
    },
    {
      id: 'row_2',
      data: {
        col_0: 'Bob Johnson',
        col_1: 'bob.johnson@email.com',
        col_2: '555-0125',
        col_3: 'Sales'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isValid: true,
        errors: {}
      }
    }
  ];

  return { columns, rows };
};