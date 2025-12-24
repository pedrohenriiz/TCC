import HelperText from '../HelperText';

interface FormSelectProps {
  label: string;
  name: string;
  options?:
    | {
        label: string;
        value: number | string;
      }[]
    | [];
  helpText?: string;
  required?: boolean;
  formik: any;
}

export default function Select({
  label,
  required,
  formik,
  options = [],
  helpText,
  name,
}: FormSelectProps) {
  const hasError = formik?.touched[name] && formik?.errors[name];

  return (
    <div className='text-left'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label} {required && '*'}
      </label>

      <select
        className={`w-full px-4 py-3 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      >
        {options.map((opt) => {
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>

      {hasError && (
        <p className='text-sm text-red-600 mt-2'>{formik?.errors[name]}</p>
      )}
      {helpText && <HelperText text={helpText} />}
    </div>
  );
}
