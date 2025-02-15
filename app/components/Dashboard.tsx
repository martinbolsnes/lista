'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lists');
      if (response.ok) {
        const data = await response.json();
        setLists(data);
        setLoading(false);
      } else {
        console.error('Failed to fetch lists');
      }
    } catch (error) {
      console.error('An error occurred while fetching lists:', error);
    }
  };

  const createNewList = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName }),
      });
      if (response.ok) {
        setNewListName('');
        fetchLists();
        setLoading(false);
      } else {
        console.error('Failed to create new list');
      }
    } catch (error) {
      console.error('An error occurred while creating a new list:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <h3 className='font-sans font-bold text-xl'>Dine lister</h3>
      <form onSubmit={createNewList} className='flex space-x-2'>
        <Input
          type='text'
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder='Navn på ny liste'
          className='text-base font-serif'
          required
        />

        <Button variant='secondary' type='submit'>
          {loading ? <LoadingSpinner /> : <Plus />}
        </Button>
      </form>
      <div className='flex flex-col space-y-4'>
        {lists.map((list: any) => (
          <Link href={`/list/${list._id}`} key={list._id}>
            <Card>
              <CardHeader>
                <CardTitle className='font-serif'>{list.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
