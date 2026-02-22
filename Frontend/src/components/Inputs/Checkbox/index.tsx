import HelperText from '../HelperText';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  label,
  checked = false,
  name,
  helpText,
  error,
  disabled = false,
  className = '',
  onChange,
}: CheckboxProps) {
  const hasError = Boolean(error);

  return (
    <div className={`flex align-center text-left ${className}`}>
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className={`w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 ${
            hasError ? 'border-red-500' : ''
          }`}
        />

        {label && (
          <span className='text-sm font-medium text-gray-700'>{label}</span>
        )}
      </label>

      {hasError && <p className='text-sm text-red-600 mt-1'>{error}</p>}

      {helpText && <HelperText text={helpText} />}
    </div>
  );
}
