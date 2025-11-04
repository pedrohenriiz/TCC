import clsx from 'clsx';

interface ConfirmButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  Icon: React.ReactNode;
  iconPosition: 'left' | 'right';
  text: string;
}

export default function ConfirmButton({
  onClick,
  Icon,
  iconPosition,
  text,
  className,
  ...rest
}: ConfirmButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-300 hover:cursor-pointer disabled:hover:cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {iconPosition === 'left' && Icon}
      {text}
      {iconPosition === 'right' && Icon}
    </button>
  );
}
