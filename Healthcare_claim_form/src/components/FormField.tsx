import React, { useState, useEffect } from 'react';
import { FormFieldProps } from '../types/FormTypes';
import { ValidationResult, validateField } from '../utils/formUtils';

interface ExtendedFormFieldProps extends FormFieldProps {
  validation?: ValidationResult;
  showValidation?: boolean;
}

export type { ExtendedFormFieldProps };

export const FormField: React.FC<ExtendedFormFieldProps> = (props: ExtendedFormFieldProps) => {
  const {
    label,
    name,
    value,
    onChange,
    type = 'text',
    required = false,
    options,
    placeholder,
    className = '',
    fieldType = 'text',
    validation,
    showValidation = false,
    step
  } = props;
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [localValidation, setLocalValidation] = useState<ValidationResult | null>(null);

  // Determine if we should show validation
  const shouldShowValidation = showValidation || hasBeenTouched || isFocused;
  const isInvalid = shouldShowValidation && (validation || localValidation) && !(validation || localValidation)?.isValid;
  const hasError = isInvalid && (validation || localValidation)?.message;
  const isValid = shouldShowValidation && (validation || localValidation) && (validation || localValidation)?.isValid;
  const hasValue = typeof value === 'string' ? value.trim().length > 0 : value !== false && value !== null;

  // Validate field whenever value changes
  useEffect(() => {
    if (hasBeenTouched || isFocused) {
      const timeoutId = setTimeout(() => {
        const result = validateField(name, value);
        setLocalValidation(result);
      }, 300); // Small delay for better UX

      return () => clearTimeout(timeoutId);
    }
  }, [name, value, hasBeenTouched, isFocused]);

  // Clear local validation when external validation is provided
  useEffect(() => {
    if (validation) {
      setLocalValidation(null);
    }
  }, [validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setHasBeenTouched(true);

    if (fieldType === 'checkbox') {
      onChange(name, (e.target as HTMLInputElement).checked);
    } else {
      onChange(name, e.target.value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setHasBeenTouched(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
    // Trigger validation on blur
    const result = validateField(name, value);
    setLocalValidation(result);
  };

  const handleCheckboxGroupChange = (optionValue: string, checked: boolean) => {
    setHasBeenTouched(true);

    const currentValues = Array.isArray(value) ? value : [];
    if (checked) {
      onChange(name, [...currentValues, optionValue]);
    } else {
      onChange(name, currentValues.filter(v => v !== optionValue));
    }
  };

  // Dynamic styling based on validation state
  const getInputClasses = () => {
    let baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${className}`;

    if (isInvalid) {
      baseClasses += ' border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50';
    } else if (isValid && hasValue) {
      baseClasses += ' border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50';
    } else {
      baseClasses += ' border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    }

    return baseClasses;
  };

  const getCheckboxClasses = () => {
    let baseClasses = 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200';

    if (isInvalid) {
      baseClasses += ' border-red-300 focus:ring-red-500';
    } else if (isValid && hasValue) {
      baseClasses += ' border-green-300 focus:ring-green-500';
    }

    return baseClasses;
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldType === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={typeof value === 'string' ? value : ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className={getInputClasses()}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : fieldType === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={typeof value === 'boolean' ? value : false}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            className={getCheckboxClasses()}
          />
          <span className="ml-2 text-sm text-gray-600">Yes</span>
        </div>
      ) : fieldType === 'checkboxGroup' && options ? (
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`${name}-${option.value}`}
                checked={Array.isArray(value) ? value.includes(option.value) : false}
                onChange={(e) => handleCheckboxGroupChange(option.value, e.target.checked)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={getCheckboxClasses()}
              />
              <label htmlFor={`${name}-${option.value}`} className="ml-2 text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      ) : fieldType === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={typeof value === 'string' ? value : ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={getInputClasses()}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={typeof value === 'string' ? value : ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          className={getInputClasses()}
          {...(step ? { step } : {})} // <-- pass step if present
        />
      )}

      {/* Error Message with Enhanced UX */}
      {hasError && (
        <div className="mt-2 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Validation Error</p>
            <p className="text-sm text-red-700 mt-1">{(validation || localValidation)?.message}</p>
          </div>
        </div>
      )}

      {/* Helper Text for Required Fields */}
      {required && !hasValue && !hasError && (
        <p className="mt-1 text-sm text-gray-500">This field is required</p>
      )}

      {/* Helper Text for Optional Fields */}
      {!required && !hasValue && !hasError && placeholder && (
        <p className="mt-1 text-sm text-gray-500">Optional field</p>
      )}
    </div>
  );
};