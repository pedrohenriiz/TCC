import HelperText from '../HelperText';

interface RadioProps<T = string | number> {
  label?: string;
  value: T;
  checked?: boolean;
  name: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string | number) => void;
}

export default function Radio({
  label,
  value,
  checked = false,
  name,
  helpText,
  error,
  disabled = false,
  className = '',
  onChange,
}: RadioProps) {
  const hasError = Boolean(error);

  return (
    <div className={`flex items-center text-left ${className}`}>
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='radio'
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className={`w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-500 ${
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
