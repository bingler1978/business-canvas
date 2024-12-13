import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    console.log('Connecting to WebSocket server...');
    this.socket = io('http://localhost:3001', {
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

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from WebSocket server...');
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
