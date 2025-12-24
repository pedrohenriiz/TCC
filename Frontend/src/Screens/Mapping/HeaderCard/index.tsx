type HeaderCardProps = {
  label: string;
  value?: number;
  Icon: React.ReactNode;
  color: string;
};

export default function HeaderCard({
  label,
  value = 0,
  Icon,
  color,
}: HeaderCardProps) {
  return (
    <div className='flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
      <span
        className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
      >
        {Icon}
      </span>

      <span className='flex flex-col text-left'>
        <span className='text-xs text-gray-600'>{label}</span>
        <span className='text-xl font-bold text-gray-900'>{value}</span>
      </span>
    </div>
  );
}
