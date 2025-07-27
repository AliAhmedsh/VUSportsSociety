// Export all types from individual files
export * from './User';
export * from './Event';
export * from './Team';

// Common types that don't belong to a specific domain
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type FormErrors = {
  [key: string]: string | undefined;
};

// Common form field types
export type FormField = {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'hidden';
  options?: SelectOption[];
  validation?: {
    required?: string | boolean;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: any) => string | boolean | Promise<string | boolean>;
  };
};
