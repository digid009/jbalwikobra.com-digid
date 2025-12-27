import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  id,
  label,
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'scale-90' : '';
  return (
    <div className={`inline-flex items-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        id={id}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`toggle ${checked ? 'active' : ''} ${sizeClasses} ${className}`}
      />
      {label && (
        <label htmlFor={id} className="form-label !mb-0 cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;
