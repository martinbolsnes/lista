import Auth from './components/Auth';
import { getUserIdFromToken } from '@/lib/auth';
import Dashboard from './components/Dashboard';

export default function Home({ request }: { request: Request }) {
  const userId = getUserIdFromToken(request);

  if (!userId) {
    return (
      <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-8'>
        <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'>
          <h1 className='text-4xl font-bold font-mono mb-8 text-center'>
            LISTA
          </h1>
          <Auth />
        </div>
      </main>
    );
  }
  return (
    <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'>
        <Dashboard />
      </div>
    </main>
  );
}
