import { FormField, ValidationError } from '../types';

/**
 * Validate a form field based on its validation rules
 * @param value - The field value to validate
 * @param field - The form field configuration
 * @returns An error message if validation fails, otherwise undefined
 */
export const validateField = (
  value: any,
  field: FormField
): string | undefined => {
  const { validation, label } = field;
  
  if (!validation) return undefined;
  
  // Check required field
  if (validation.required) {
    const requiredMessage = typeof validation.required === 'string' 
      ? validation.required 
      : `${label || 'This field'} is required`;
    
    if (value === undefined || value === null || value === '') {
      return requiredMessage;
    }
  }
  
  // Check min length
  if (validation.minLength && String(value).length < validation.minLength.value) {
    return validation.minLength.message || 
      `${label || 'Field'} must be at least ${validation.minLength.value} characters`;
  }
  
  // Check max length
  if (validation.maxLength && String(value).length > validation.maxLength.value) {
    return validation.maxLength.message || 
      `${label || 'Field'} must be at most ${validation.maxLength.value} characters`;
  }
  
  // Check pattern
  if (validation.pattern && !validation.pattern.value.test(String(value))) {
    return validation.pattern.message || 
      `${label || 'Field'} is not valid`;
  }
  
  // Custom validation function
  if (validation.validate) {
    const customValidation = validation.validate(value);
    if (typeof customValidation === 'string') {
      return customValidation;
    } else if (customValidation === false) {
      return `${label || 'Field'} is not valid`;
    }
  }
  
  return undefined;
};

/**
 * Validate a form with multiple fields
 * @param formData - The form data object
 * @param fields - The form fields configuration
 * @returns An object with validation errors (if any)
 */
export const validateForm = (
  formData: Record<string, any>,
  fields: FormField[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    const value = formData[field.name];
    const error = validateField(value, field);
    
    if (error) {
      errors[field.name] = error;
    }
  });
  
  return errors;
};

/**
 * Get initial form values from form fields
 * @param fields - The form fields configuration
 * @returns An object with initial form values
 */
export const getInitialFormValues = (fields: FormField[]): Record<string, any> => {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Get initial form errors from form fields
 * @param fields - The form fields configuration
 * @returns An object with initial form errors
 */
export const getInitialFormErrors = (fields: FormField[]): Record<string, string> => {
  return fields.reduce((acc, field) => {
    if (field.required) {
      acc[field.name] = ''; // Initialize with empty string for required fields
    }
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Check if a form is valid
 * @param errors - The form errors object
 * @returns True if there are no errors
 */
export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.values(errors).every(error => !error);
};

/**
 * Format form data before submission
 * @param formData - The form data to format
 * @param fields - The form fields configuration
 * @returns The formatted form data
 */
export const formatFormData = (
  formData: Record<string, any>,
  fields: FormField[]
): Record<string, any> => {
  const formattedData: Record<string, any> = {};
  
  fields.forEach(field => {
    const value = formData[field.name];
    
    // Skip undefined values
    if (value === undefined) return;
    
    // Apply field formatter if provided
    if (field.format) {
      formattedData[field.name] = field.format(value);
    } else {
      formattedData[field.name] = value;
    }
  });
  
  return formattedData;
};

/**
 * Parse form data from an API response or other source
 * @param data - The data to parse
 * @param fields - The form fields configuration
 * @returns The parsed form data
 */
export const parseFormData = (
  data: Record<string, any>,
  fields: FormField[]
): Record<string, any> => {
  const formData: Record<string, any> = {};
  
  fields.forEach(field => {
    const value = data[field.name];
    
    // Apply field parser if provided
    if (field.parse) {
      formData[field.name] = field.parse(value);
    } else {
      formData[field.name] = value;
    }
  });
  
  return formData;
};

/**
 * Create a form change handler
 * @param setFormData - The state setter for form data
 * @param setErrors - The state setter for form errors
 * @param fields - The form fields configuration
 * @returns A function to handle form field changes
 */
export const createFormChangeHandler = (
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fields: FormField[]
) => {
  return (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the field if it has validation rules
    const field = fields.find(f => f.name === name);
    if (field && field.validation) {
      const error = validateField(value, field);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };
};

/**
 * Create a form submit handler
 * @param formData - The form data
 * @param setErrors - The state setter for form errors
 * @param fields - The form fields configuration
 * @param onSubmit - The submit callback function
 * @returns A function to handle form submission
 */
export const createFormSubmitHandler = (
  formData: Record<string, any>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fields: FormField[],
  onSubmit: (data: Record<string, any>) => void | Promise<void>
) => {
  return async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(formData[field.name], field);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (hasErrors) {
      return;
    }
    
    // Format the form data
    const formattedData = formatFormData(formData, fields);
    
    // Call the submit callback
    try {
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle form submission error (e.g., show error message)
      throw error;
    }
  };
};

/**
 * Reset a form to its initial state
 * @param initialValues - The initial form values
 * @param setFormData - The state setter for form data
 * @param setErrors - The state setter for form errors
 */
export const resetForm = (
  initialValues: Record<string, any>,
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  setFormData(initialValues);
  setErrors({});
};

/**
 * Create a form reset handler
 * @param initialValues - The initial form values
 * @param setFormData - The state setter for form data
 * @param setErrors - The state setter for form errors
 * @returns A function to handle form reset
 */
export const createFormResetHandler = (
  initialValues: Record<string, any>,
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  return (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    resetForm(initialValues, setFormData, setErrors);
  };
};

/**
 * Get field error message
 * @param errors - The form errors object
 * @param name - The field name
 * @returns The error message for the field, or undefined if no error
 */
export const getFieldError = (
  errors: Record<string, string>,
  name: string
): string | undefined => {
  return errors[name];
};

/**
 * Check if a field has an error
 * @param errors - The form errors object
 * @param name - The field name
 * @returns True if the field has an error
 */
export const hasError = (
  errors: Record<string, string>,
  name: string
): boolean => {
  return Boolean(errors[name]);
};

/**
 * Create a form field props object for use with form controls
 * @param name - The field name
 * @param value - The field value
 * @param error - The field error message
 * @param onChange - The change handler function
 * @returns An object with common form field props
 */
export const createFieldProps = (
  name: string,
  value: any,
  error: string | undefined,
  onChange: (name: string, value: any) => void
) => {
  return {
    name,
    value: value || '',
    onChange: (e: any) => {
      const newValue = e?.target?.value !== undefined ? e.target.value : e;
      onChange(name, newValue);
    },
    error: Boolean(error),
    helperText: error,
  };
};
