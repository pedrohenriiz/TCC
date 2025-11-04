import HelperText from '../HelperText';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  formik: any;
}

export default function Textfield({
  label,
  name,
  type = 'text',
  placeholder,
  helpText,
  required = false,
  formik,
}: FormInputProps) {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div>
      <label className='block text-sm font-semibold text-gray-700 mb-2 text-left'>
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {hasError && (
        <p className='mt-1 text-sm text-red-600 text-left'>
          {formik.errors[name]}
        </p>
      )}
      {helpText && <HelperText text={helpText} />}
    </div>
  );
}
