// React Native compatible WebSocket service
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventHandlers = {};
  }

  // Initialize WebSocket connection with authentication
  async connect() {
    try {
      // Get the auth token
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token found, cannot connect to WebSocket');
        return false;
      }

      // Disconnect if already connected
      if (this.ws) {
        this.disconnect();
      }

      // Create WebSocket connection with authentication token in URL
      const wsUrl = `ws://10.0.2.2:5000?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      // Set up event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return false;
    }
  }

  // Set up event listeners
  setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      
      // Attempt to reconnect if not manually disconnected
      if (event.code !== 100) { // 1000 is normal close
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
 }

  // Handle incoming messages
  handleMessage(data) {
    const { event, ...payload } = data;
    
    switch (event) {
      case 'newOrder':
        this.handleNewOrder(payload);
        break;
      case 'orderUpdate':
        this.handleOrderUpdate(payload);
        break;
      case 'driverLocationUpdate':
        this.handleLocationUpdate(payload);
        break;
      case 'notification':
        this.handleNotification(payload);
        break;
      case 'driverStatusUpdate':
        this.handleDriverStatusUpdate(payload);
        break;
      default:
        console.log('Unknown event received:', event, payload);
        break;
    }
  }

  // Handle new order
  handleNewOrder(data) {
    console.log('New order received:', data);
    // Trigger any registered handlers
    if (this.eventHandlers['newOrder']) {
      this.eventHandlers['newOrder'](data);
    }
  }

  // Handle order update
  handleOrderUpdate(data) {
    console.log('Order update received:', data);
    // Trigger any registered handlers
    if (this.eventHandlers['orderUpdate']) {
      this.eventHandlers['orderUpdate'](data);
    }
  }

  // Handle location update
  handleLocationUpdate(data) {
    console.log('Driver location update received:', data);
    // Trigger any registered handlers
    if (this.eventHandlers['driverLocationUpdate']) {
      this.eventHandlers['driverLocationUpdate'](data);
    }
  }

  // Handle notification
  handleNotification(data) {
    console.log('Notification received:', data);
    // Trigger any registered handlers
    if (this.eventHandlers['notification']) {
      this.eventHandlers['notification'](data);
    }
 }

  // Handle driver status update
 handleDriverStatusUpdate(data) {
    console.log('Driver status update received:', data);
    // Trigger any registered handlers
    if (this.eventHandlers['driverStatusUpdate']) {
      this.eventHandlers['driverStatusUpdate'](data);
    }
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  // Send driver status update
 sendDriverStatusUpdate(isAvailable) {
    if (this.ws && this.isConnected) {
      const message = {
        event: 'driverStatusUpdate',
        data: { isAvailable }
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Send location update
  sendLocationUpdate(location) {
    if (this.ws && this.isConnected) {
      const message = {
        event: 'locationUpdate',
        data: location
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Accept an order
  acceptOrder(orderId) {
    if (this.ws && this.isConnected) {
      const message = {
        event: 'acceptOrder',
        data: { orderId }
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Register event handler
  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  // Remove event handler
  off(event) {
    delete this.eventHandlers[event];
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.isConnected = false;
      this.ws = null;
    }
  }
  
  // Check if connection should be established (token exists)
  async shouldConnect() {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  }

  // Check if connected
  getIsConnected() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;