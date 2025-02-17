import Pusher from 'pusher-js';

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// Add logging for connection state changes
pusherClient.connection.bind('state_change', (states: { current: string }) => {
  console.log('Pusher connection state changed:', states.current);
});

export default pusherClient;
