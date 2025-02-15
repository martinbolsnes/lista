'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          document.cookie = `token=${data.token}; path=/;`;
          router.refresh();
        } else {
          alert(
            isLogin ? 'Login failed' : 'Registration successful. Please log in.'
          );
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'An error occurred');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Epost'
        className='font-serif text-base'
        required
      />
      <Input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Passord'
        className='font-serif text-base'
        required
      />
      <Button className='font-sans' type='submit'>
        {isLogin ? 'Logg inn' : 'Registrer deg'}
      </Button>
      <Button
        className='font-serif'
        type='button'
        variant='link'
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? 'Har du ikke en konto? Registrer deg'
          : 'Har du allerede en konto? Logg inn'}
      </Button>
    </form>
  );
}
