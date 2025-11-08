import clsx from 'clsx';

type ButtonVariant =
  | 'edit'
  | 'delete'
  | 'view'
  | 'primary'
  | 'success'
  | 'warning';

interface TableButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  Icon: React.ReactNode;
  variant: ButtonVariant;
}
export default function TableButton({
  Icon,
  title,
  onClick,
  className,
  variant = 'primary',
  ...rest
}: TableButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    edit: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    delete: 'bg-red-100 text-red-700 hover:bg-red-200',
    view: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'p-2 rounded-lg transition hover:cursor-pointer disabled:hover:cursor-not-allowed',
        variants[variant],
        className
      )}
      title={title}
      {...rest}
    >
      {Icon}
    </button>
  );
}
