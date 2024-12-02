const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('./logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.restaurantClients = new Map();

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    // ��������Ͽ�������
    setInterval(() => {
      this.cleanupConnections();
    }, 30000);
  }

  handleConnection(ws, req) {
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // �����û����ʹ洢����
      if (decoded.type === 'restaurant') {
        this.restaurantClients.set(decoded.id, ws);
      } else {
        this.clients.set(decoded.id, ws);
      }

      // �����������
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // ������Ϣ
      ws.on('message', (message) => {
        this.handleMessage(decoded.id, decoded.type, message);
      });

      // �������ӹر�
      ws.on('close', () => {
        if (decoded.type === 'restaurant') {
          this.restaurantClients.delete(decoded.id);
        } else {
          this.clients.delete(decoded.id);
        }
        logger.info(`WebSocket connection closed for user ${decoded.id}`);
      });

      // ���ͻ�ӭ��Ϣ
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        userId: decoded.id,
        userType: decoded.type
      }));

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
      ws.close();
    }
  }

  handleMessage(userId, userType, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.sendToUser(userId, userType, {
            type: 'pong',
            message: 'Server is alive'
          });
          break;

        case 'order_status':
          this.handleOrderStatusUpdate(userId, userType, data);
          break;

        case 'chat_message':
          this.handleChatMessage(userId, userType, data);
          break;

        case 'delivery_location':
          this.handleDeliveryLocation(userId, userType, data);
          break;

        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  sendToUser(userId, userType, data) {
    const clients = userType === 'restaurant' ? this.restaurantClients : this.clients;
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data, excludeUserId = null) {
    // �㲥�����пͻ�
    this.clients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });

    // �㲥�����в���
    this.restaurantClients.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  // ���Ͷ���״̬����
  sendOrderUpdate(userId, orderData) {
    this.sendToUser(userId, 'customer', {
      type: 'orderUpdate',
      data: orderData
    });

    // ͬʱ֪ͨ����
    if (orderData.restaurant_id) {
      this.sendToUser(orderData.restaurant_id, 'restaurant', {
        type: 'orderUpdate',
        data: orderData
      });
    }
  }

  // ������֪ͨ
  sendNotification(userId, userType, notification) {
    this.sendToUser(userId, userType, {
      type: 'notification',
      data: notification
    });
  }

  // ����������Ϣ
  sendChatMessage(fromUserId, toUserId, message) {
    const chatData = {
      type: 'chat_message',
      data: {
        from: fromUserId,
        message: message,
        timestamp: new Date().toISOString()
      }
    };

    // ���͸�������
    this.sendToUser(toUserId, 'customer', chatData);
    // ���͸������ߣ�ȷ����Ϣ�ѷ��ͣ�
    this.sendToUser(fromUserId, 'customer', {
      ...chatData,
      status: 'sent'
    });
  }

  // ��������λ�ø���
  sendDeliveryLocation(orderId, location) {
    const locationData = {
      type: 'delivery_location',
      data: {
        order_id: orderId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      }
    };

    // ֪ͨ��صĿͻ��Ͳ���
    if (location.customer_id) {
      this.sendToUser(location.customer_id, 'customer', locationData);
    }
    if (location.restaurant_id) {
      this.sendToUser(location.restaurant_id, 'restaurant', locationData);
    }
  }

  // ������״̬����
  handleOrderStatusUpdate(userId, userType, data) {
    const { order_id, status, message } = data;
    // ��֤Ȩ��
    if (userType !== 'restaurant') {
      logger.warn(`Unauthorized order status update attempt by user ${userId}`);
      return;
    }
    // �㲥����״̬����
    this.sendOrderUpdate(data.customer_id, {
      order_id,
      status,
      message,
      updated_at: new Date().toISOString()
    });
  }

  // ����������Ϣ
  handleChatMessage(userId, userType, data) {
    const { to_user_id, message } = data;
    this.sendChatMessage(userId, to_user_id, message);
  }

  // ��������λ�ø���
  handleDeliveryLocation(userId, userType, data) {
    const { order_id, latitude, longitude } = data;
    this.sendDeliveryLocation(order_id, {
      latitude,
      longitude,
      customer_id: data.customer_id,
      restaurant_id: data.restaurant_id
    });
  }

  // ����Ͽ�������
  cleanupConnections() {
    const cleanup = (clients) => {
      clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          ws.terminate();
          clients.delete(userId);
          logger.info(`Terminated inactive connection for user ${userId}`);
        } else {
          ws.isAlive = false;
          ws.ping();
        }
      });
    };

    cleanup(this.clients);
    cleanup(this.restaurantClients);
  }
}

module.exports = WebSocketServer; 