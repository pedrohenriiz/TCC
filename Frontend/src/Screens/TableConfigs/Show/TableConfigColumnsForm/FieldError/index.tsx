export default function FieldError({
  name,
  formik,
}: {
  name: string;
  formik: any;
}) {
  if (formik.submitCount === 0) return null;

  const parts = name.split('.');
  let error: any = formik.errors;

  for (const part of parts) {
    if (error) error = error[part];
  }

  if (!error) return null;

  return <div className='text-xs text-red-600 mt-1 font-medium'>{error}</div>;
}
