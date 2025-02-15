import Dashboard from './components/Dashboard';
export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'>
        <Dashboard />
      </div>
    </main>
  );
}
