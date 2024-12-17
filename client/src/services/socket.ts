import { io, Socket } from 'socket.io-client';

// 获取当前域名和协议
const getBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const port = process.env.REACT_APP_API_PORT || '3001';
  return `${protocol}//${hostname}:${port}`;
};

const SOCKET_URL = process.env.REACT_APP_API_URL || getBaseUrl();

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    console.log('Connecting to WebSocket server at:', SOCKET_URL);
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      this.socket.on('connect', () => {
        console.log('WebSocket connected! Socket ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });
    }
    return this.socket;
  }

  disconnect(): void {
    console.log('Disconnecting from WebSocket server...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      console.log(`Emitting ${event} event:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected! Cannot emit event:', event);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      console.log(`Listening for ${event} event`);
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      console.log(`Removing listener for ${event} event`);
      this.socket.off(event);
    }
  }
}

export default new SocketService();
