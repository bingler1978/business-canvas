import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
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
