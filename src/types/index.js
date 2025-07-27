/**
 * Common API response structure
 * @typedef {Object} ApiResponse
 * @property {any} [data] - Response data
 * @property {string} [error] - Error message if any
 * @property {boolean} success - Whether the request was successful
 */

/**
 * Paginated response structure
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - Array of items
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total number of pages
 */

/**
 * Select option for dropdowns
 * @typedef {Object} SelectOption
 * @property {string} label - Display text
 * @property {string|number} value - Option value
 * @property {boolean} [disabled] - Whether the option is disabled
 */

/**
 * Validation error
 * @typedef {Object} ValidationError
 * @property {string} field - Field name with error
 * @property {string} message - Error message
 */

/**
 * Form errors mapping
 * @typedef {Object.<string, string>} FormErrors
 */

/**
 * Form field configuration
 * @typedef {Object} FormField
 * @property {string} name - Field name
 * @property {string} label - Field label
 * @property {boolean} [required] - Whether the field is required
 * @property {boolean} [disabled] - Whether the field is disabled
 * @property {string} [placeholder] - Field placeholder text
 * @property {'text'|'email'|'password'|'number'|'date'|'time'|'datetime'|'select'|'multiselect'|'checkbox'|'radio'|'textarea'|'file'|'hidden'} [type] - Input type
 * @property {Array<SelectOption>} [options] - Options for select/radio/checkbox
 * @property {Object} [validation] - Validation rules
 * @property {string|boolean} [validation.required] - Required validation
 * @property {{value: number, message: string}} [validation.minLength] - Minimum length
 * @property {{value: number, message: string}} [validation.maxLength] - Maximum length
 * @property {{value: RegExp, message: string}} [validation.pattern] - Pattern validation
 * @property {function(any): (string|boolean|Promise<string|boolean>)} [validation.validate] - Custom validation function
 */
