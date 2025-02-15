'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Item {
  _id: string;
  content: string;
  completed: boolean;
}

interface List {
  _id: string;
  name: string;
}

export default function ListComponent({ listId }: { listId: string }) {
  const [listName, setListName] = useState<List>();
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchListName();
    fetchItems();
  }, []);

  const fetchListName = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setListName(data);
        setLoading(false);
      } else {
        console.error('Failed to fetch list name');
      }
    } catch (error) {
      console.error('An error occurred while fetching list name:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setLoading(false);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('An error occurred while fetching items:', error);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItem }),
      });
      if (response.ok) {
        setNewItem('');
        fetchItems();
        setLoading(false);
      } else {
        console.error('Failed to add item');
      }
    } catch (error) {
      console.error('An error occurred while adding an item:', error);
    }
  };

  const toggleItem = async (itemId: string, completed: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed }),
      });
      if (response.ok) {
        fetchItems();
        setLoading(false);
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('An error occurred while updating an item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (response.ok) {
        fetchItems();
        setLoading(false);
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('An error occurred while deleting an item:', error);
    }
  };

  return (
    <div className='w-full max-w-md space-y-4'>
      <h2 className='font-sans text-xl'>{listName?.name || ''}</h2>
      <form onSubmit={addItem} className='flex space-x-2'>
        <Input
          type='text'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder='Ny ting'
          className='flex-grow text-base font-serif'
        />

        <Button className='font-serif' type='submit'>
          {loading ? <LoadingSpinner /> : 'Legg til'}
        </Button>
      </form>
      <ul className='space-y-4'>
        {items.map((item) => (
          <li
            key={item._id}
            className='flex font-sans font-bold items-center justify-between space-x-2'
          >
            <div className='flex items-center space-x-2'>
              <Checkbox
                id={item._id}
                className='h-7 w-7'
                checked={item.completed}
                onCheckedChange={(checked) =>
                  toggleItem(item._id, checked as boolean)
                }
              />
              <label
                htmlFor={item._id}
                className={`text-xl ${
                  item.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {item.content}
              </label>
            </div>
            <Button
              type='submit'
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => deleteItem(item._id)}
            >
              <Plus className='rotate-45' />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
