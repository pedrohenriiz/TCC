export default function PageHeader({ title }: { title: string }) {
  return (
    <h2 className='text-2xl font-semibold text-gray-800 text-left'>{title}</h2>
  );
}
