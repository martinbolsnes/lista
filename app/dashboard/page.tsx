import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='w-full items-center justify-between font-mono text-sm mx-auto'>
        <h1 className='hidden'>Dashboard</h1>
        <Dashboard />
      </div>
    </main>
  );
}
