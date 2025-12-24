import { ArrowLeft } from 'lucide-react';
import PageHeader from '../pageHeader';
import ConfirmButton from '../ConfirmButton';
import type React from 'react';

interface CustomHeaderProps {
  showBackButton?: boolean;
  buttonProps?: {
    onClick: () => void;
    iconPosition: 'left' | 'right';
    Icon: React.ReactNode;
    text: string;
  };
  title: string;
  subtitle?: string;
  showConfirmButton?: boolean;
  handleGoBack?: () => void;
}

export default function CustomHeader({
  showBackButton = false,
  buttonProps,
  showConfirmButton,
  handleGoBack,
  title,
  subtitle,
}: CustomHeaderProps) {
  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-6xl mx-auto py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-cente justify-between'>
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className='p-2 hover:bg-gray-100 rounded-lg transition hover:cursor-pointer mr-2'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
            )}

            <div>
              <PageHeader title={title} />
              {subtitle && (
                <p className='text-xs text-gray-600 mt-0.5'>{subtitle}</p>
              )}
            </div>
          </div>

          {showConfirmButton && buttonProps && (
            <ConfirmButton
              Icon={buttonProps.Icon}
              iconPosition={buttonProps.iconPosition}
              onClick={buttonProps.onClick}
              text={buttonProps.text}
            />
          )}
        </div>
      </div>
    </div>
  );
}
