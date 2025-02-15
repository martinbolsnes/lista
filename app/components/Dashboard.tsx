'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth, useUser } from '@clerk/nextjs';

interface List {
  _id: string;
  name: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [lists, setLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState('');
  const [loadingLists, setLoadingLists] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  // Ensure user exists in MongoDB
  useEffect(() => {
    if (user) {
      fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.firstName,
        }),
      }).catch((err) => console.error('Error syncing user:', err));
    }
  }, [user]);

  // Fetch lists
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) throw new Error('Failed to fetch lists');

      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  const createNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingList(true);

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName }),
      });

      if (!response.ok) throw new Error('Failed to create new list');

      setNewListName('');
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setCreatingList(false);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return (
      <div>
        <p>Logg inn for å se dine lister</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='font-sans font-bold text-xl'>Dine lister</h3>

      {/* Create List Form */}
      <form onSubmit={createNewList} className='flex space-x-2'>
        <Input
          type='text'
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder='Navn på ny liste'
          className='text-base font-serif'
          required
        />

        <Button variant='secondary' type='submit' disabled={creatingList}>
          {creatingList ? <LoadingSpinner /> : <Plus />}
        </Button>
      </form>

      {/* List Display */}
      {loadingLists ? (
        <LoadingSpinner />
      ) : (
        <div className='flex flex-col space-y-4'>
          {lists.map((list) => (
            <Link href={`/list/${list._id}`} key={list._id}>
              <Card>
                <CardHeader>
                  <CardTitle className='font-serif'>{list.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
