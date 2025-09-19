import React from 'react';
import { PNText } from '../ui/PinkNeonDesignSystem';

interface FormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  helpText,
  error,
  children
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-white mb-3">
          {label} {required && <span className="text-pink-400">*</span>}
        </label>
      )}
      {children}
      {helpText && (
        <PNText className="text-sm text-gray-400">
          {helpText}
        </PNText>
      )}
      {error && (
        <PNText className="text-sm text-red-400">
          {error}
        </PNText>
      )}
    </div>
  );
};

export default FormField;
