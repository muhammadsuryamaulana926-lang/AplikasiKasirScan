import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api-config';

const SOCKET_URL = API_CONFIG.BACKEND_URL;

let socketInstance = null;
let heartbeatInterval = null;
let isManualDisconnect = false;

export const connectSocket = () => {
  if (!socketInstance) {
    console.log('🔌 Connecting to:', SOCKET_URL);
    
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      forceNew: false,
      transports: ['websocket', 'polling']
    });
    
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      isManualDisconnect = false;
      
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      
      heartbeatInterval = setInterval(() => {
        if (socketInstance && socketInstance.connected) {
          socketInstance.emit('ping');
        }
      }, 25000);
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      
      if (!isManualDisconnect && reason !== 'io client disconnect') {
        console.log('🔄 Will auto-reconnect...');
      }
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });
    
    socketInstance.on('pong', () => {
      console.log('🏓 Pong received');
    });
  }
  
  if (!socketInstance.connected && !isManualDisconnect) {
    socketInstance.connect();
  }
  
  return socketInstance;
};

export const disconnectSocket = () => {
  isManualDisconnect = true;
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
    console.log('🔌 Socket disconnected manually');
  }
};

// Getter untuk socket instance
export const getSocket = () => socketInstance;
