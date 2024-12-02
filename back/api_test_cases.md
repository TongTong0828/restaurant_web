# 餐厅系统 API 测试文档

## 1. 餐厅列表和详情接口

### 1.1 获取餐厅列表
```http
GET /api/restaurants?page=1&limit=10&search=川菜&category=中餐&sort=rating
Authorization: Bearer <token>  // 可选
```

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

### 1.2 获取餐厅详情
```http
GET /api/restaurants/1
Authorization: Bearer <token>  // 可选
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
                    "category": "热菜"
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

### 1.3 获取餐厅菜单
```http
GET /api/restaurants/1/menu-items?category=热菜
Authorization: Bearer <token>  // 可选
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "categories": ["热菜", "凉菜", "主食"],
        "items": [
            {
                "id": 1,
                "name": "宫保鸡丁",
                "description": "经典川菜",
                "price": 38.00,
                "image": "http://example.com/images/dish1.jpg",
                "category": "热菜"
            }
        ]
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

## 2. 订单管理接口

### 2.1 创建订单
```http
POST /api/orders
Authorization: Bearer <token>  // 必需

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
        "instructions": "不要辣"
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
            }
        }
    }
}
```

#### 失败响应
```json
{
    "status": "fail",
    "message": "Insufficient balance" | "Restaurant is closed" | "Menu items not available"
}
```

### 2.2 用户查看订单列表
```http
GET /api/auth/orders?status=all
Authorization: Bearer <token>  // 必需
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
                "created_at": "2023-12-20T10:00:00Z"
            }
        ]
    }
}
```

### 2.3 餐厅查看订单列表
```http
GET /api/auth/restaurant/orders?status=pending
Authorization: Bearer <token>  // 必需
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

### 2.4 更新订单状态
```http
PUT /api/orders/1/status
Authorization: Bearer <token>  // 必需

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

### 2.5 获取订单详情
```http
GET /api/auth/orders/1
Authorization: Bearer <token>  // 必需
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "order": {
            "id": 1,
            "restaurant_name": "川味轩",
            "status": "confirmed",
            "items": [
                {
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
            "created_at": "2023-12-20T10:00:00Z",
            "updated_at": "2023-12-20T10:05:00Z"
        }
    }
}
```

## 3. 餐厅仪表盘接口

### 3.1 获取仪表盘数据
```http
GET /api/auth/restaurant/dashboard
Authorization: Bearer <token>  // 必需
```

#### 成功响应 (200 OK)
```json
{
    "status": "success",
    "data": {
        "today_orders": 10,
        "today_revenue": 760.00,
        "pending_orders": 3,
        "total_menu_items": 20,
        "popular_items": [
            {
                "name": "宫保鸡丁",
                "orders": 50,
                "revenue": 1900.00
            }
        ],
        "recent_orders": [
            {
                "id": 1,
                "status": "confirmed",
                "total_amount": 76.00,
                "created_at": "2023-12-20T10:00:00Z"
            }
        ]
    }
}
```

## 4. 通用错误响应

### 4.1 认证错误 (401 Unauthorized)
```json
{
    "status": "fail",
    "message": "Authentication required"
}
```

### 4.2 权限错误 (403 Forbidden)
```json
{
    "status": "fail",
    "message": "Not authorized to perform this action"
}
```

### 4.3 资源不存在 (404 Not Found)
```json
{
    "status": "fail",
    "message": "Resource not found"
}
```

### 4.4 验证错误 (400 Bad Request)
```json
{
    "status": "fail",
    "message": "Invalid input data",
    "errors": {
        "field": "error message"
    }
}
```

### 4.5 服务器错误 (500 Internal Server Error)
```json
{
    "status": "error",
    "message": "Internal server error"
}
```

## 5. 测试说明

### 5.1 测试环境
- Base URL: `http://your-api-domain.com`
- 测试账号:
  - 用户: `customer@test.com` / `123321`
  - 餐厅: `restaurant@test.com` / `123321`

### 5.2 测试流程建议
1. 注册餐厅账号
2. 上传餐厅图片和菜品图片
3. 添加菜品到菜单
4. 使用用户账号浏览餐厅
5. 创建订单
6. 测试订单状态流转
7. 测试实时通知

### 5.3 注意事项
1. 所有带 Authorization 的请求需要先获取 token
2. 图片上传大小限制为 5MB
3. 订单状态变更需要按照正确的流程
4. WebSocket 连接需要保持心跳