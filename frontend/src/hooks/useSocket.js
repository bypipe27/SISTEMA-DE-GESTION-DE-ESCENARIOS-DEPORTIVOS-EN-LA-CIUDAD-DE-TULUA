import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function initSocket(url) {
  if (!socket) {
    socket = io(url, { autoConnect: true });
  }
  return socket;
}

export default function useSocket(url, handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = initSocket(url);
    const s = socketRef.current;
    // register handlers
    Object.entries(handlers).forEach(([event, fn]) => {
      s.on(event, fn);
    });

    return () => {
      if (!s) return;
      Object.entries(handlers).forEach(([event, fn]) => {
        s.off(event, fn);
      });
    };
  }, [url]);

  return socketRef.current;
}