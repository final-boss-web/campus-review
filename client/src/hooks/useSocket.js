import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (onNotificationReceived, onNewPlaceReceived, onNewScamReceived) => {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Connect to WebSockets server
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'], // force pure WebSockets
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully:', socketRef.current.id);
      
      // If authenticated, join user-specific notification room
      if (isAuthenticated && user?.id) {
        socketRef.current.emit('join_room', user.id);
      }
    });

    // Register listeners
    if (onNotificationReceived) {
      socketRef.current.on('notification', onNotificationReceived);
    }
    if (onNewPlaceReceived) {
      socketRef.current.on('new_place', onNewPlaceReceived);
    }
    if (onNewScamReceived) {
      socketRef.current.on('new_scam_alert', onNewScamReceived);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user?.id, onNotificationReceived, onNewPlaceReceived, onNewScamReceived]);

  const emitEvent = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emitEvent };
};

export default useSocket;
