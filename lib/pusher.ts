import PusherServer from "pusher";
import Pusher from "pusher-js";

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    host: process.env.NEXT_PUSHER_APP_HOST!,
    port: '6001',
    useTLS: false,
});

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    wsHost: process.env.NEXT_PUSHER_APP_HOST,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1',
});