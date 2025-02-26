'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Share, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShareListModal } from './ShareListModal';
import { Skeleton } from '@/components/ui/skeleton';

interface List {
  _id: string;
  name: string;
  ownerId: string;
  isShared?: boolean;
  isOwner: boolean;
  sharedBy?: {
    name: string;
    profileImage: string;
  } | null;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  const [lists, setLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState('');
  const [loadingLists, setLoadingLists] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [selectedShareList, setSelectedShareList] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) throw new Error('Failed to fetch lists');

      const data = await response.json();
      setLists(
        data.map((list: List) => ({
          ...list,
          isOwner: list.ownerId === userId,
        }))
      );
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Klarte ikke hente listene',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
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
      toast({
        title: 'Feil',
        description: 'Klarte ikke opprette listen',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteClick = (list: List) => {
    setSelectedList(list);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedList) return;

    try {
      const response = await fetch(`/api/lists/${selectedList._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete list');

      setLists((prevLists) =>
        prevLists.filter((list) => list._id !== selectedList._id)
      );
      toast({ title: 'Slettet', description: 'Listen ble slettet' });
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Klarte ikke slette listen',
        variant: 'destructive',
      });
      throw new Error(`${error}`);
    } finally {
      setDialogOpen(false);
      setSelectedList(null);
    }
  };

  const ownedLists = lists.filter((list) => list.isOwner);
  const sharedLists = lists.filter((list) => !list.isOwner);

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
    <div className='space-y-4'>
      {loadingLists ? (
        <Skeleton className='h-4 w-[200px]' />
      ) : lists.length === 0 ? (
        <h2 className='font-sans text-lg'>Legg til din første liste</h2>
      ) : null}
      <form onSubmit={createNewList} className='flex space-x-2'>
        <Input
          type='text'
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder='Ny liste'
          className='text-base font-sans'
          required
        />
        <Button variant='default' type='submit' disabled={creatingList}>
          {creatingList ? <LoadingSpinner /> : <Plus />}
        </Button>
      </form>

      {loadingLists ? (
        <LoadingSpinner />
      ) : (
        <div className='flex flex-col space-y-4'>
          {ownedLists.length > 0 && (
            <div className='space-y-4'>
              <h3 className='font-sans text-lg mb-2'>Dine lister</h3>
              {ownedLists.map((list) => (
                <Card
                  key={list._id}
                  className='bg-bw flex justify-between items-center px-2 mb-2'
                >
                  <Link href={`/list/${list._id}`} className='flex-grow'>
                    <CardHeader>
                      <CardTitle className='font-sans font-semibold text-lg'>
                        {list.name}
                      </CardTitle>
                      {/* {list.isShared && list.sharedBy && (
                        <div className='flex items-center space-x-2 mt-1 text-sm text-gray-500'>
                          {list.sharedBy.profileImage && (
                            <img
                              src={
                                list.sharedBy.profileImage || '/placeholder.svg'
                              }
                              alt={list.sharedBy.name}
                              className='w-6 h-6 rounded-full'
                            />
                          )}
                          <span className='font-medium'>
                            {list.sharedBy.name}
                          </span>
                        </div>
                      )} */}
                    </CardHeader>
                  </Link>
                  <div className='flex space-x-2'>
                    {list.isOwner && (
                      <Button
                        className='border border-border bg-bw'
                        variant='noShadow'
                        size='icon'
                        onClick={() => {
                          setSelectedShareList(list._id);
                          setShareOpen(true);
                        }}
                      >
                        <Share />
                      </Button>
                    )}
                    <Button
                      className='font-sans border border-border bg-bw'
                      variant='noShadow'
                      size='icon'
                      onClick={() => handleDeleteClick(list)}
                    >
                      <Trash color='#DB3939' />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {sharedLists.length > 0 && (
            <div className='space-y-4'>
              <h3 className='font-sans text-lg mb-2'>Delt med deg</h3>
              {sharedLists.map((list) => (
                <Card
                  key={list._id}
                  className='bg-bw flex justify-between items-center px-2 mb-2'
                >
                  <Link href={`/list/${list._id}`} className='flex-grow'>
                    <CardHeader>
                      <CardTitle className='font-sans font-semibold text-lg'>
                        {list.name}
                      </CardTitle>
                      {/* {list.isShared && list.sharedBy && (
                        <div className='flex items-center space-x-2 mt-1 text-sm text-gray-500'>
                          {list.sharedBy.profileImage && (
                            <img
                              src={
                                list.sharedBy.profileImage || '/placeholder.svg'
                              }
                              alt={list.sharedBy.name}
                              className='w-6 h-6 rounded-full'
                            />
                          )}
                          <span className='font-medium'>
                            {list.sharedBy.name}
                          </span>
                        </div>
                      )} */}
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedShareList && (
        <ShareListModal
          listId={selectedShareList}
          isOpen={isShareOpen}
          setOpen={setShareOpen}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='font-sans'>Bekreft sletting</DialogTitle>
            <DialogDescription className='font-sans'>
              Er du sikker på at du vil slette listen? Denne handlingen er
              permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-x-2 sm:space-y-0'>
            <Button
              className='font-sans'
              variant='neutral'
              onClick={() => setDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button
              className='font-sans'
              variant='default'
              onClick={confirmDelete}
            >
              Slett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
