import InteractiveListComponent from '../../components/InteractiveListComponent';

export default function ListPage({ params }: { params: { id: string } }) {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='w-full items-center justify-between font-mono text-sm'>
        <h1 className='hidden'>LISTA</h1>
        <InteractiveListComponent listId={params.id} />
      </div>
    </main>
  );
}
