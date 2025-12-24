import clsx from 'clsx';
import type React from 'react';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon: React.ReactNode;
  iconPosition: 'left' | 'right';
  text: string;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: React.ReactNode;
}

export default function Chip({
  Icon,
  iconPosition,
  text,
  className,
  color = 'green',
  ...rest
}: ChipProps) {
  const chipVariantConfig = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: 'text-green-600',
      hover: 'hover:bg-green-200',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: 'text-blue-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: 'text-red-600',
    },
    yellow: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: 'text-amber-600',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: 'text-gray-600',
    },
  };

  const config = chipVariantConfig[color];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        config?.bg,
        config?.text,
        className
      )}
      {...rest}
    >
      {iconPosition === 'left' && Icon}
      {text}
      {iconPosition === 'right' && Icon}
    </span>
  );
}
