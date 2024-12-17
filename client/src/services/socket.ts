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
      this.socket = io(SOCKET_URL);
      console.log('Socket connected');
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
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
