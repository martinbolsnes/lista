import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';

interface ShareListModalProps {
  listId: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function ShareListModal({
  listId,
  isOpen,
  setOpen,
}: ShareListModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lists/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, userEmail: email }),
      });

      if (!response.ok) throw new Error('Failed to share list');

      toast({
        title: 'Liste delt',
        description: `Listen er delt med ${email}`,
      });
      setOpen(false);
      setEmail('');
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke dele listen' });
      throw new Error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='font-sans'>Del liste</DialogTitle>
          <DialogDescription className='font-sans'>
            Brukeren du vil invitere må ha sin epost registrert
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder='Brukerens e-post'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <DialogFooter className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-x-2 sm:space-y-0'>
          <Button
            variant='outline'
            className='font-sans'
            onClick={() => setOpen(false)}
          >
            Avbryt
          </Button>
          <Button
            className='font-sans'
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Del'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
