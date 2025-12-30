import type { FormikProps } from 'formik';

interface MigrationProjectProps {
  name: string;
  description: string;
}

type MigrationProjectFormProps = FormikProps<MigrationProjectProps>;
