import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <main className='fflex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'>
        <h1 className='hidden'>Dashboard</h1>
        <Dashboard />
      </div>
    </main>
  );
}
