'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import pusherClient from '@/lib/pusher';

interface Item {
  _id: string;
  content: string;
  completed: boolean;
}

interface List {
  _id: string;
  name: string;
  isOwner: boolean;
  canEdit: boolean;
}

export default function InteractiveListComponent({
  listId,
}: {
  listId: string;
}) {
  const [listName, setListName] = useState<List>();
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingListName, setLoadingListName] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke hente innhold i liste',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
    } finally {
      setLoadingItems(false);
    }
  }, [listId]);

  useEffect(() => {
    const fetchListName = async () => {
      setLoadingListName(true);
      try {
        const response = await fetch(`/api/lists/${listId}`);
        if (!response.ok) throw new Error('Failed to fetch list name');
        const data = await response.json();
        setListName(data);
      } catch (error) {
        toast({
          title: 'Feil',
          description: 'Kunne ikke hente navn på liste',
          variant: 'destructive',
        });
        throw new Error(`${error}`);
      } finally {
        setLoadingListName(false);
      }
    };

    fetchListName();
    fetchItems();

    const channel = pusherClient.subscribe(`list-${listId}`);

    channel.bind('pusher:subscription_succeeded', () => {});

    channel.bind('item-added', (newItem: Item) => {
      setItems((prevItems) => [newItem, ...prevItems]);
    });

    channel.bind(
      'item-updated',
      ({ itemId, completed }: { itemId: string; completed: boolean }) => {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, completed } : item
          )
        );
      }
    );

    channel.bind('item-deleted', ({ itemId }: { itemId: string }) => {
      setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    });

    return () => {
      pusherClient.unsubscribe(`list-${listId}`);
    };
  }, [listId]);

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
      toast({
        title: 'Feil',
        description: 'Kunne ikke legge til innhold',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
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
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere innhold',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
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
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette innhold',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
    }
  };

  if (!isLoaded) {
    return (
      <div className='flex justify-center items-center mx-auto'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className='flex justify-center items-center mx-auto'>
        <p className='font-sans'>Logg inn for å se dine lister</p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md space-y-4'>
      {loadingListName ? (
        <Skeleton className='h-4 w-[200px]' />
      ) : (
        <div className='flex items-baseline space-x-2'>
          <h2 className='font-sans text-xl'>{listName?.name}</h2>
          {!listName?.isOwner && (
            <Badge
              variant='secondary'
              className='ml-2 font-sans text-xs bg-secondary/40'
            >
              Delt liste
            </Badge>
          )}
        </div>
      )}

      {(listName?.isOwner || listName?.canEdit) && (
        <form onSubmit={addItem} className='flex space-x-2'>
          <Input
            type='text'
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder='Ny ting'
            className='flex-grow text-base font-sans'
            required
          />
          <Button className='font-sans' type='submit' disabled={addingItem}>
            {addingItem ? <LoadingSpinner /> : 'Legg til'}
          </Button>
        </form>
      )}

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
              {(listName?.isOwner || listName?.canEdit) && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => deleteItem(item._id)}
                >
                  <Plus className='rotate-45' />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
