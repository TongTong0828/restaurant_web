class WebSocketClient {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    
    this.connect();
  }

  connect() {
    const wsUrl = `ws://${window.location.host}/ws?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  handleMessage(data) {
    const listeners = this.listeners.get(data.type) || [];
    listeners.forEach(callback => callback(data.data));
  }

  // �����Ϣ������
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  // �Ƴ���Ϣ������
  off(type, callback) {
    if (!this.listeners.has(type)) return;
    const listeners = this.listeners.get(type);
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  // ���Ͷ���״̬����
  sendOrderStatus(orderId, status, message) {
    this.send({
      type: 'order_status',
      order_id: orderId,
      status,
      message
    });
  }

  // ����������Ϣ
  sendChatMessage(toUserId, message) {
    this.send({
      type: 'chat_message',
      to_user_id: toUserId,
      message
    });
  }

  // ��������λ�ø���
  sendDeliveryLocation(orderId, latitude, longitude, customerId, restaurantId) {
    this.send({
      type: 'delivery_location',
      order_id: orderId,
      latitude,
      longitude,
      customer_id: customerId,
      restaurant_id: restaurantId
    });
  }

  // �ر�����
  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ʹ��ʾ��
/*
const ws = new WebSocketClient('your-jwt-token');

// ������������
ws.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // ����UI��ʾ
});

// ����֪ͨ
ws.on('notification', (data) => {
  console.log('New notification:', data);
  // ��ʾ֪ͨ
});

// ����������Ϣ
ws.on('chat_message', (data) => {
  console.log('New message:', data);
  // �����������
});

// ��������λ�ø���
ws.on('delivery_location', (data) => {
  console.log('Delivery location updated:', data);
  // ���µ�ͼ��ʾ
});
*/ 