import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { Message } from '@/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      // Don't disconnect on component unmount — keep persistent connection
    };
  }, [token]);

  const joinRoom = useCallback((squadId: string) => {
    socketInstance?.emit('join_room', { squadId });
  }, []);

  const leaveRoom = useCallback((squadId: string) => {
    socketInstance?.emit('leave_room', { squadId });
  }, []);

  const sendMessage = useCallback((squadId: string, content: string) => {
    socketInstance?.emit('send_message', { squadId, content });
  }, []);

  const startTyping = useCallback((squadId: string) => {
    socketInstance?.emit('typing_start', { squadId });
  }, []);

  const stopTyping = useCallback((squadId: string) => {
    socketInstance?.emit('typing_stop', { squadId });
  }, []);

  const onNewMessage = useCallback((handler: (msg: Message) => void) => {
    socketInstance?.on('new_message', handler);
    return () => { socketInstance?.off('new_message', handler); };
  }, []);

  const onUserJoined = useCallback((handler: (data: any) => void) => {
    socketInstance?.on('user_joined', handler);
    return () => { socketInstance?.off('user_joined', handler); };
  }, []);

  const onUserLeft = useCallback((handler: (data: any) => void) => {
    socketInstance?.on('user_left', handler);
    return () => { socketInstance?.off('user_left', handler); };
  }, []);

  const onUserTyping = useCallback((handler: (data: any) => void) => {
    socketInstance?.on('user_typing', handler);
    return () => { socketInstance?.off('user_typing', handler); };
  }, []);

  const onUserStoppedTyping = useCallback((handler: (data: any) => void) => {
    socketInstance?.on('user_stopped_typing', handler);
    return () => { socketInstance?.off('user_stopped_typing', handler); };
  }, []);

  const onItineraryUpdate = useCallback((handler: (data: any) => void) => {
    socketInstance?.on('itinerary_update', handler);
    return () => { socketInstance?.off('itinerary_update', handler); };
  }, []);

  const broadcastItineraryUpdate = useCallback((squadId: string, itinerary: any) => {
    socketInstance?.emit('itinerary_updated', { squadId, itinerary });
  }, []);

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onUserStoppedTyping,
    onItineraryUpdate,
    broadcastItineraryUpdate,
  };
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
