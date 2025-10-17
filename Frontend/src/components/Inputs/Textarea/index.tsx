interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  rows?: number;
  formik: any;
}

export default function Textarea({
  label,
  name,
  placeholder,
  helpText,
  required = false,
  rows = 5,
  formik,
}: FormTextareaProps) {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div>
      <label className='block text-sm font-semibold text-gray-700 mb-2 text-left'>
        {label} {required && '*'}
      </label>
      <textarea
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {hasError && (
        <p className='mt-1 text-sm text-red-600 text-left'>
          {formik.errors[name]}
        </p>
      )}
      {helpText && (
        <p className='mt-1 text-sm text-gray-500 text-left'>{helpText}</p>
      )}
    </div>
  );
}
