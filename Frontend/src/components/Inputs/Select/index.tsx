import HelperText from '../HelperText';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  label?: string;
  name?: string;
  value?: string | number;
  options?: SelectOption[];
  helpText?: string;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function Select({
  label,
  required,
  value,
  options = [],
  helpText,
  name,
  error,
  onChange,
  className = '',
}: FormSelectProps) {
  const hasError = Boolean(error);

  return (
    <div className='text-left'>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label} {required && '*'}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-4 py-3 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasError && <p className='text-sm text-red-600 mt-2'>{error}</p>}
      {helpText && <HelperText text={helpText} />}
    </div>
  );
}
