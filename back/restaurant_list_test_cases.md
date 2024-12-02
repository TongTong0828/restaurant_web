# 餐厅列表与交互 API 测试文档

## 1. 餐厅列表接口

### 1.1 获取所有餐厅列表
```http
GET /api/restaurants?page=1&limit=10&search=川菜&category=中餐&sort=rating
```

请求参数：
- `page`: 页码（可选，默认1）
- `limit`: 每页数量（可选，默认10）
- `search`: 搜索关键词（可选）
- `category`: 分类筛选（可选）
- `sort`: 排序方式（可选，支持 rating/deliveryFee/minimumOrder）

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "total": 100,
        "restaurants": [
            {
                "id": 1,
                "name": "川味轩",
                "description": "正宗川菜",
                "address": "北京市朝阳区",
                "phone": "1234567890",
                "image": "http://example.com/images/restaurant1.jpg",
                "rating": 4.5,
                "delivery_fee": 5.00,
                "minimum_order": 20.00,
                "categories": ["中餐", "川菜"],
                "opening_hours": {
                    "monday": {"open": "09:00", "close": "22:00"}
                }
            }
        ]
    }
}
```

#### 失败响应
```json
{
    "status": "fail",
    "message": "Invalid query parameters"
}
```

### 1.2 获取餐厅详细信息（包含完整菜单）
```http
GET /api/restaurants/:id
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "restaurant": {
            "id": 1,
            "name": "川味轩",
            "description": "正宗川菜",
            "address": "北京市朝阳区",
            "phone": "1234567890",
            "image": "http://example.com/images/restaurant1.jpg",
            "rating": 4.5,
            "delivery_fee": 5.00,
            "minimum_order": 20.00,
            "categories": ["中餐", "川菜"],
            "opening_hours": {
                "monday": {"open": "09:00", "close": "22:00"}
            },
            "menu_items": [
                {
                    "id": 1,
                    "name": "宫保鸡丁",
                    "description": "经典川菜",
                    "price": 38.00,
                    "image": "http://example.com/images/dish1.jpg",
                    "category": "热菜",
                    "is_available": true
                }
            ]
        }
    }
}
```

#### 失败响应 (404 Not Found)
```json
{
    "status": "fail",
    "message": "Restaurant not found"
}
```

## 2. 用户-餐厅交互接口

### 2.1 创建订单
```http
POST /api/orders
Authorization: Bearer <token>

{
    "restaurant_id": 1,
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        }
    ],
    "delivery_info": {
        "address": "北京市朝阳区xx街xx号",
        "phone": "13800138000",
        "name": "张三",
        "instructions": "不要太辣"
    },
    "payment_method": "online"
}
```

#### 成功响应 (201 Created)
```json
{
    "status": "success",
    "data": {
        "order": {
            "id": 1,
            "status": "pending",
            "restaurant": {
                "id": 1,
                "name": "川味轩",
                "phone": "1234567890"
            },
            "items": [
                {
                    "id": 1,
                    "name": "宫保鸡丁",
                    "quantity": 2,
                    "price": 38.00
                }
            ],
            "total_amount": 76.00,
            "delivery_info": {
                "address": "北京市朝阳区xx街xx号",
                "phone": "13800138000",
                "name": "张三"
            },
            "created_at": "2023-12-20T10:00:00Z"
        }
    }
}
```

#### 失败响应
```json
{
    "status": "fail",
    "message": "Restaurant is closed" | "Menu items not available" | "Minimum order amount not met"
}
```

### 2.2 用户查看订单
```http
GET /api/auth/orders?status=all
Authorization: Bearer <token>
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "orders": [
            {
                "id": 1,
                "restaurant_name": "川味轩",
                "status": "pending",
                "total_amount": 76.00,
                "created_at": "2023-12-20T10:00:00Z",
                "items": [
                    {
                        "name": "宫保鸡丁",
                        "quantity": 2,
                        "price": 38.00
                    }
                ]
            }
        ]
    }
}
```

### 2.3 餐厅接收订单
```http
GET /api/auth/restaurant/orders?status=pending
Authorization: Bearer <restaurant_token>
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "orders": [
            {
                "id": 1,
                "customer_name": "张三",
                "status": "pending",
                "total_amount": 76.00,
                "items": [
                    {
                        "name": "宫保鸡丁",
                        "quantity": 2,
                        "price": 38.00
                    }
                ],
                "delivery_info": {
                    "address": "北京市朝阳区xx街xx号",
                    "phone": "13800138000",
                    "name": "张三"
                },
                "created_at": "2023-12-20T10:00:00Z"
            }
        ]
    }
}
```

### 2.4 餐厅更新订单状态
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <restaurant_token>

{
    "status": "confirmed"
}
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "order": {
            "id": 1,
            "status": "confirmed",
            "updated_at": "2023-12-20T10:05:00Z"
        }
    }
}
```

#### 失败响应
```json
{
    "status": "fail",
    "message": "Invalid status transition" | "Order not found" | "Not authorized"
}
```

## 3. 实时订单通知

### 3.1 WebSocket 连接
```javascript
// 建立WebSocket连接
const ws = new WebSocket('ws://your-domain/ws');
ws.onopen = () => {
    // 发送认证信息
    ws.send(JSON.stringify({
        type: 'auth',
        token: 'your_jwt_token'
    }));
};

// 监听订单更新
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'ORDER_UPDATE') {
        console.log('订单状态更新:', data);
        // {
        //     type: 'ORDER_UPDATE',
        //     orderId: 1,
        //     status: 'confirmed',
        //     timestamp: '2023-12-20T10:05:00Z'
        // }
    }
};
```

## 4. 测试流程示例

1. 获取餐厅列表
```bash
curl -X GET "http://your-domain/api/restaurants?page=1&limit=10"
```

2. 获取特定餐厅详情
```bash
curl -X GET "http://your-domain/api/restaurants/1"
```

3. 创建订单
```bash
curl -X POST "http://your-domain/api/orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": 1,
    "items": [{"menu_item_id": 1, "quantity": 2}],
    "delivery_info": {
        "address": "北京市朝阳区xx街xx号",
        "phone": "13800138000",
        "name": "张三"
    },
    "payment_method": "online"
  }'
```

4. 餐厅查看待处理订单
```bash
curl -X GET "http://your-domain/api/auth/restaurant/orders?status=pending" \
  -H "Authorization: Bearer <restaurant_token>"
```

5. 餐厅确认订单
```bash
curl -X PUT "http://your-domain/api/orders/1/status" \
  -H "Authorization: Bearer <restaurant_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 5. 注意事项

1. **认证要求**
   - 用户相关操作需要用户token
   - 餐厅相关操作需要餐厅token
   - token通过登录接口获取

2. **订单状态流转**
   - pending（待确认）
   - confirmed（已确认）
   - preparing（准备中）
   - ready（待配送）
   - delivering（配送中）
   - completed（已完成）
   - cancelled（已取消）

3. **错误处理**
   - 401: 未认证
   - 403: 无权限
   - 404: 资源不存在
   - 400: 请求参数错误
   - 500: 服务器错误

4. **实时通知**
   - WebSocket连接需要保持心跳
   - 断线后需要自动重连
   - 需要处理认证失效的情况 