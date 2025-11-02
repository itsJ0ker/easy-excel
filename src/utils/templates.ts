import type { Template } from '../types';

export const defaultTemplates: Template[] = [
  {
    id: 'contact-list',
    name: 'Contact List',
    description: 'Manage contacts with names, emails, and phone numbers',
    category: 'Personal',
    icon: '👥',
    columns: [
      { id: 'first_name', name: 'First Name', type: 'text', required: true },
      { id: 'last_name', name: 'Last Name', type: 'text', required: true },
      { id: 'email', name: 'Email', type: 'email', required: false },
      { id: 'phone', name: 'Phone', type: 'phone', required: false },
      { id: 'company', name: 'Company', type: 'text', required: false },
      { id: 'notes', name: 'Notes', type: 'text', required: false }
    ]
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Track expenses with categories and amounts',
    category: 'Finance',
    icon: '💰',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'description', name: 'Description', type: 'text', required: true },
      { id: 'category', name: 'Category', type: 'text', required: true, validation: { options: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'] } },
      { id: 'amount', name: 'Amount', type: 'currency', required: true, format: { currency: 'USD', decimalPlaces: 2 } },
      { id: 'payment_method', name: 'Payment Method', type: 'text', required: false, validation: { options: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'] } }
    ]
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Track products, quantities, and prices',
    category: 'Business',
    icon: '📦',
    columns: [
      { id: 'sku', name: 'SKU', type: 'text', required: true },
      { id: 'product_name', name: 'Product Name', type: 'text', required: true },
      { id: 'category', name: 'Category', type: 'text', required: true },
      { id: 'quantity', name: 'Quantity', type: 'number', required: true, validation: { min: 0 } },
      { id: 'unit_price', name: 'Unit Price', type: 'currency', required: true, format: { currency: 'USD', decimalPlaces: 2 } },
      { id: 'supplier', name: 'Supplier', type: 'text', required: false },
      { id: 'reorder_level', name: 'Reorder Level', type: 'number', required: false, validation: { min: 0 } }
    ]
  },
  {
    id: 'employee-directory',
    name: 'Employee Directory',
    description: 'Manage employee information and details',
    category: 'HR',
    icon: '👔',
    columns: [
      { id: 'employee_id', name: 'Employee ID', type: 'text', required: true },
      { id: 'full_name', name: 'Full Name', type: 'text', required: true },
      { id: 'email', name: 'Email', type: 'email', required: true },
      { id: 'department', name: 'Department', type: 'text', required: true },
      { id: 'position', name: 'Position', type: 'text', required: true },
      { id: 'hire_date', name: 'Hire Date', type: 'date', required: true },
      { id: 'salary', name: 'Salary', type: 'currency', required: false, format: { currency: 'USD', decimalPlaces: 0 } },
      { id: 'phone', name: 'Phone', type: 'phone', required: false }
    ]
  },
  {
    id: 'project-tasks',
    name: 'Project Tasks',
    description: 'Track project tasks and their status',
    category: 'Project Management',
    icon: '📋',
    columns: [
      { id: 'task_id', name: 'Task ID', type: 'text', required: true },
      { id: 'task_name', name: 'Task Name', type: 'text', required: true },
      { id: 'description', name: 'Description', type: 'text', required: false },
      { id: 'assignee', name: 'Assignee', type: 'text', required: true },
      { id: 'status', name: 'Status', type: 'text', required: true, validation: { options: ['Not Started', 'In Progress', 'Review', 'Completed', 'Blocked'] } },
      { id: 'priority', name: 'Priority', type: 'text', required: true, validation: { options: ['Low', 'Medium', 'High', 'Critical'] } },
      { id: 'due_date', name: 'Due Date', type: 'date', required: false },
      { id: 'completion', name: 'Completion %', type: 'percentage', required: false, validation: { min: 0, max: 100 } }
    ]
  },
  {
    id: 'sales-leads',
    name: 'Sales Leads',
    description: 'Track sales leads and opportunities',
    category: 'Sales',
    icon: '🎯',
    columns: [
      { id: 'lead_id', name: 'Lead ID', type: 'text', required: true },
      { id: 'company_name', name: 'Company Name', type: 'text', required: true },
      { id: 'contact_name', name: 'Contact Name', type: 'text', required: true },
      { id: 'email', name: 'Email', type: 'email', required: true },
      { id: 'phone', name: 'Phone', type: 'phone', required: false },
      { id: 'lead_source', name: 'Lead Source', type: 'text', required: true, validation: { options: ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Advertisement'] } },
      { id: 'status', name: 'Status', type: 'text', required: true, validation: { options: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] } },
      { id: 'estimated_value', name: 'Estimated Value', type: 'currency', required: false, format: { currency: 'USD', decimalPlaces: 0 } },
      { id: 'close_date', name: 'Expected Close Date', type: 'date', required: false }
    ]
  },
  {
    id: 'student-grades',
    name: 'Student Grades',
    description: 'Track student performance and grades',
    category: 'Education',
    icon: '🎓',
    columns: [
      { id: 'student_id', name: 'Student ID', type: 'text', required: true },
      { id: 'student_name', name: 'Student Name', type: 'text', required: true },
      { id: 'subject', name: 'Subject', type: 'text', required: true },
      { id: 'assignment', name: 'Assignment', type: 'text', required: true },
      { id: 'grade', name: 'Grade', type: 'number', required: true, validation: { min: 0, max: 100 } },
      { id: 'date_submitted', name: 'Date Submitted', type: 'date', required: false },
      { id: 'feedback', name: 'Feedback', type: 'text', required: false }
    ]
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Plan and track event details and attendees',
    category: 'Events',
    icon: '🎉',
    columns: [
      { id: 'event_name', name: 'Event Name', type: 'text', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'venue', name: 'Venue', type: 'text', required: true },
      { id: 'attendee_name', name: 'Attendee Name', type: 'text', required: true },
      { id: 'email', name: 'Email', type: 'email', required: true },
      { id: 'rsvp_status', name: 'RSVP Status', type: 'text', required: true, validation: { options: ['Pending', 'Confirmed', 'Declined', 'Maybe'] } },
      { id: 'dietary_restrictions', name: 'Dietary Restrictions', type: 'text', required: false },
      { id: 'plus_one', name: 'Plus One', type: 'boolean', required: false }
    ]
  }
];

export const getTemplatesByCategory = () => {
  const categories: Record<string, Template[]> = {};
  defaultTemplates.forEach(template => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  });
  return categories;
};