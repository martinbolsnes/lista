import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function Header() {
  const user = await currentUser();
  return (
    <div className='bg-bw border-b-4 border-border px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10'>
      <Link href='/'>
        <h1 className='font-mono text-3xl text-background'>LISTA</h1>
      </Link>
      <div className='flex items-center space-x-4'>
        <SignedOut>
          <SignInButton>
            <Button variant='neutral' size='sm'>
              Logg inn
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='neutral' className='bg-main'>
              <Menu className={cn('w-6 h-6')} />
            </Button>
          </SheetTrigger>
          <SheetContent className={cn('border border-border')}>
            <SheetHeader className={cn('flex text-left')}>
              <SheetTitle>
                <Link href='/'>
                  <p
                    className={cn(
                      `text-md sm:text-lg font-bold font-mono -mb-2`
                    )}
                  >
                    LISTA
                  </p>
                </Link>
              </SheetTitle>
              <SheetDescription className='hidden'>LISTA</SheetDescription>
            </SheetHeader>
            <div className={cn('flex flex-col items-end gap-4 py-6 text-lg')}>
              {!user ? (
                <>
                  <SheetTrigger asChild>
                    <SignInButton>
                      <Button variant='neutral' className='font-semibold'>
                        Logg inn
                      </Button>
                    </SignInButton>
                  </SheetTrigger>
                </>
              ) : (
                <>
                  <SheetTrigger asChild>
                    <Link href='/'>
                      <Button variant='neutral' className='font-semibold'>
                        Hjem
                      </Button>
                    </Link>
                  </SheetTrigger>
                  <SheetTrigger asChild>
                    <Link href='/dashboard'>
                      <Button variant='neutral' className='font-semibold'>
                        Dine lister
                      </Button>
                    </Link>
                  </SheetTrigger>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
