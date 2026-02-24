export default function SkeletonLoading() {
  return (
    <div className='border border-gray-200 rounded-lg p-4 bg-white'>
      <div className='grid grid-cols-12 gap-3 items-center mb-4'>
        <div className='col-span-3 space-y-2'>
          <div className='h-3 w-20 rounded skeleton-shimmer' />
          <div className='h-10 rounded-lg skeleton-shimmer' />
        </div>

        <div className='col-span-2 space-y-2'>
          <div className='h-3 w-16 rounded skeleton-shimmer' />
          <div className='h-10 rounded-lg skeleton-shimmer' />
        </div>

        <div className='col-span-2 space-y-2'>
          <div className='h-3 w-20 rounded skeleton-shimmer' />
          <div className='h-10 rounded-lg skeleton-shimmer' />
        </div>

        <div className='col-span-3 flex gap-4 pt-5'>
          <div className='h-5 w-14 rounded skeleton-shimmer' />
          <div className='h-5 w-14 rounded skeleton-shimmer' />
        </div>

        <div className='col-span-2 flex justify-end pt-5'>
          <div className='h-5 w-20 rounded skeleton-shimmer' />
        </div>
      </div>

      <div className='pt-4 border-t border-gray-200 space-y-3'>
        <div className='h-4 w-48 rounded skeleton-shimmer' />

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='h-3 w-32 rounded skeleton-shimmer' />
            <div className='h-10 rounded-lg skeleton-shimmer' />
          </div>
          <div className='space-y-2'>
            <div className='h-3 w-32 rounded skeleton-shimmer' />
            <div className='h-10 rounded-lg skeleton-shimmer' />
          </div>
        </div>
      </div>
    </div>
  );
}
