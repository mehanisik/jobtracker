export default function Spinner() {
  return (
    <div className='flex h-screen items-center justify-center bg-background'>
      <div className='relative flex flex-col items-center justify-center gap-4 text-xl font-bold text-primary uppercase'>
        <div className='absolute h-24 w-24 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-8 border-t-primary border-r-transparent border-b-primary border-l-transparent'></div>

        <div className='absolute h-20 w-20 animate-spin rounded-full border-8 border-t-primary border-r-transparent border-b-primary border-l-transparent'></div>
      </div>
    </div>
  );
}
