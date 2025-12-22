import Spinner from './spinner';

export default function Loader() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center'>
      <Spinner />
    </div>
  );
}
