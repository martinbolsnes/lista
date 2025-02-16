import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
          <DialogTitle>Del liste</DialogTitle>
        </DialogHeader>
        <Input
          placeholder='Brukerens e-post'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleShare} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Del'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
