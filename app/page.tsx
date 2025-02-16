'use client';

import Dashboard from './components/Dashboard';
import { SignInButton, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const saveUserToDatabase = async () => {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.emailAddresses[0],
              name: user.fullName,
            }),
          });

          if (!response.ok) {
            console.error('Error saving user data to the database.');
          }
        } catch (error) {
          console.error('Failed to save user:', error);
        }
      };

      saveUserToDatabase();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!user) {
    return (
      <div className='flex flex-col mx-auto justify-center items-center mt-8 p-8'>
        <h2 className='font-mono text-3xl'>LISTA</h2>
        <p className='font-sans font-semibold'>
          Din eneste app for dine lister
        </p>
        <div className='flex flex-col space-y-4 mt-8 justify-items-center'>
          <Card>
            <CardTitle className='flex justify-items-center font-sans font-semibold text-lg p-6'>
              <FileText className='mr-2' />
              Flere lister på en plass
            </CardTitle>
            <CardContent className='font-sans'>
              Lag flere lister for forskjellige gjøremål og ha de enkelt samlet
              i en og samme app
            </CardContent>
          </Card>
          <Card>
            <CardTitle className='flex justify-items-center font-sans font-semibold text-lg p-6'>
              <Users className='mr-2' />
              Del listene dine
            </CardTitle>
            <CardContent className='font-sans'>
              Inviter andre brukere til å bruke listene dine og ha full kontroll
              på alle punkt
            </CardContent>
          </Card>
          <SignInButton>
            <Button className='w-full font-sans font-semibold'>
              Kom i gang
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <main className='flex min-h-screen flex-col items-center p-4 max-w-3xl mx-auto mt-4'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'>
        <Dashboard />
      </div>
    </main>
  );
}
