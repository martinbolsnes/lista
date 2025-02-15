'use client';

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
  const [loadingItems, setLoadingItems] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListName();
    fetchItems();
  }, []);

  const fetchListName = async () => {
    try {
      const response = await fetch(`/api/lists`);
      if (!response.ok) throw new Error('Failed to fetch list name');
      const data = await response.json();
      setListName(data[0]);
    } catch (error) {
      console.error(error);
      setError('Kunne ikke hente listen.');
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      setError('Kunne ikke hente elementer.');
    } finally {
      setLoadingItems(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAddingItem(true);

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItem }),
      });
      if (!response.ok) throw new Error('Failed to add item');

      const newItemData = await response.json();
      setItems((prevItems) => [
        ...prevItems,
        { ...newItemData, completed: false },
      ]);
      setNewItem('');
    } catch (error) {
      console.error(error);
      setError('Kunne ikke legge til element.');
    } finally {
      setAddingItem(false);
      fetchItems();
    }
  };

  const toggleItem = async (itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed }),
      });
      if (!response.ok) throw new Error('Failed to update item');

      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, completed } : item
        )
      );
    } catch (error) {
      console.error(error);
      setError('Kunne ikke oppdatere element.');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (!response.ok) throw new Error('Failed to delete item');

      setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error(error);
      setError('Kunne ikke slette element.');
    }
  };

  return (
    <div className='w-full max-w-md space-y-4'>
      {error && <p className='text-red-500'>{error}</p>}

      <h2 className='font-sans text-xl'>{listName?.name || 'Laster...'}</h2>

      {/* Add New Item Form */}
      <form onSubmit={addItem} className='flex space-x-2'>
        <Input
          type='text'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder='Ny ting'
          className='flex-grow text-base font-serif'
          required
        />
        <Button className='font-serif' type='submit' disabled={addingItem}>
          {addingItem ? <LoadingSpinner /> : 'Legg til'}
        </Button>
      </form>

      {loadingItems ? (
        <LoadingSpinner />
      ) : (
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
                    toggleItem(item._id, checked === true)
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
                type='button'
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
      )}
    </div>
  );
}
