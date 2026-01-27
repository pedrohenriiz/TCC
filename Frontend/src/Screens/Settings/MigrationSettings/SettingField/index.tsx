interface SettingFieldProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

export default function SettingField({
  id,
  label,
  description,
  value,
  onChange,
  options,
}: SettingFieldProps) {
  return (
    <div className='flex items-start justify-between'>
      <div className='flex-1 text-left'>
        <label htmlFor={id} className='block text-sm font-medium text-gray-900'>
          {label}
        </label>
        <p className='text-sm text-gray-500 mt-1'>{description}</p>
      </div>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className='ml-6 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
