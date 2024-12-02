# ����ϵͳ API �����ĵ�

## 1. �����б������ӿ�

### 1.1 ��ȡ�����б�
```http
GET /api/restaurants?page=1&limit=10&search=����&category=�в�&sort=rating
Authorization: Bearer <token>  // ��ѡ
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "total": 100,
        "restaurants": [
            {
                "id": 1,
                "name": "��ζ��",
                "description": "���ڴ���",
                "address": "�����г�����",
                "phone": "1234567890",
                "image": "http://example.com/images/restaurant1.jpg",
                "rating": 4.5,
                "delivery_fee": 5.00,
                "minimum_order": 20.00,
                "categories": ["�в�", "����"],
                "opening_hours": {
                    "monday": {"open": "09:00", "close": "22:00"}
                }
            }
        ]
    }
}
```

#### ʧ����Ӧ
```json
{
    "status": "fail",
    "message": "Invalid query parameters"
}
```

### 1.2 ��ȡ��������
```http
GET /api/restaurants/1
Authorization: Bearer <token>  // ��ѡ
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "restaurant": {
            "id": 1,
            "name": "��ζ��",
            "description": "���ڴ���",
            "address": "�����г�����",
            "phone": "1234567890",
            "image": "http://example.com/images/restaurant1.jpg",
            "rating": 4.5,
            "delivery_fee": 5.00,
            "minimum_order": 20.00,
            "categories": ["�в�", "����"],
            "opening_hours": {
                "monday": {"open": "09:00", "close": "22:00"}
            },
            "menu_items": [
                {
                    "id": 1,
                    "name": "��������",
                    "description": "���䴨��",
                    "price": 38.00,
                    "image": "http://example.com/images/dish1.jpg",
                    "category": "�Ȳ�"
                }
            ]
        }
    }
}
```

#### ʧ����Ӧ (404 Not Found)
```json
{
    "status": "fail",
    "message": "Restaurant not found"
}
```

### 1.3 ��ȡ�����˵�
```http
GET /api/restaurants/1/menu-items?category=�Ȳ�
Authorization: Bearer <token>  // ��ѡ
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "categories": ["�Ȳ�", "����", "��ʳ"],
        "items": [
            {
                "id": 1,
                "name": "��������",
                "description": "���䴨��",
                "price": 38.00,
                "image": "http://example.com/images/dish1.jpg",
                "category": "�Ȳ�"
            }
        ]
    }
}
```

#### ʧ����Ӧ (404 Not Found)
```json
{
    "status": "fail",
    "message": "Restaurant not found"
}
```

## 2. ��������ӿ�

### 2.1 ��������
```http
POST /api/orders
Authorization: Bearer <token>  // ����

{
    "restaurant_id": 1,
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        }
    ],
    "delivery_info": {
        "address": "�����г�����xx��xx��",
        "phone": "13800138000",
        "name": "����",
        "instructions": "��Ҫ��"
    },
    "payment_method": "online"
}
```

#### �ɹ���Ӧ (201 Created)
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
                    "name": "��������",
                    "quantity": 2,
                    "price": 38.00
                }
            ],
            "total_amount": 76.00,
            "delivery_info": {
                "address": "�����г�����xx��xx��",
                "phone": "13800138000",
                "name": "����"
            }
        }
    }
}
```

#### ʧ����Ӧ
```json
{
    "status": "fail",
    "message": "Insufficient balance" | "Restaurant is closed" | "Menu items not available"
}
```

### 2.2 �û��鿴�����б�
```http
GET /api/auth/orders?status=all
Authorization: Bearer <token>  // ����
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "orders": [
            {
                "id": 1,
                "restaurant_name": "��ζ��",
                "status": "pending",
                "total_amount": 76.00,
                "created_at": "2023-12-20T10:00:00Z"
            }
        ]
    }
}
```

### 2.3 �����鿴�����б�
```http
GET /api/auth/restaurant/orders?status=pending
Authorization: Bearer <token>  // ����
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "orders": [
            {
                "id": 1,
                "customer_name": "����",
                "status": "pending",
                "total_amount": 76.00,
                "items": [
                    {
                        "name": "��������",
                        "quantity": 2,
                        "price": 38.00
                    }
                ],
                "delivery_info": {
                    "address": "�����г�����xx��xx��",
                    "phone": "13800138000",
                    "name": "����"
                },
                "created_at": "2023-12-20T10:00:00Z"
            }
        ]
    }
}
```

### 2.4 ���¶���״̬
```http
PUT /api/orders/1/status
Authorization: Bearer <token>  // ����

{
    "status": "confirmed"
}
```

#### �ɹ���Ӧ (200 OK)
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

#### ʧ����Ӧ
```json
{
    "status": "fail",
    "message": "Invalid status transition" | "Order not found" | "Not authorized"
}
```

### 2.5 ��ȡ��������
```http
GET /api/auth/orders/1
Authorization: Bearer <token>  // ����
```

#### �ɹ���Ӧ (200 OK)
```json
{
    "status": "success",
    "data": {
        "order": {
            "id": 1,
            "restaurant_name": "��ζ��",
            "status": "confirmed",
            "items": [
                {
                    "name": "��������",
                    "quantity": 2,
                    "price": 38.00
                }
            ],
            "total_amount": 76.00,
            "delivery_info": {
                "address": "�����г�����xx��xx��",
                "phone": "13800138000",
                "name": "����"
            },
            "created_at": "2023-12-20T10:00:00Z",
            "updated_at": "2023-12-20T10:05:00Z"
        }
    }
}
```

## 3. �����Ǳ��̽ӿ�

### 3.1 ��ȡ�Ǳ�������
```http
GET /api/auth/restaurant/dashboard
Authorization: Bearer <token>  // ����
```

#### �ɹ���Ӧ (200 OK)
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
                "name": "��������",
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

## 4. ͨ�ô�����Ӧ

### 4.1 ��֤���� (401 Unauthorized)
```json
{
    "status": "fail",
    "message": "Authentication required"
}
```

### 4.2 Ȩ�޴��� (403 Forbidden)
```json
{
    "status": "fail",
    "message": "Not authorized to perform this action"
}
```

### 4.3 ��Դ������ (404 Not Found)
```json
{
    "status": "fail",
    "message": "Resource not found"
}
```

### 4.4 ��֤���� (400 Bad Request)
```json
{
    "status": "fail",
    "message": "Invalid input data",
    "errors": {
        "field": "error message"
    }
}
```

### 4.5 ���������� (500 Internal Server Error)
```json
{
    "status": "error",
    "message": "Internal server error"
}
```

## 5. ����˵��

### 5.1 ���Ի���
- Base URL: `http://your-api-domain.com`
- �����˺�:
  - �û�: `customer@test.com` / `123321`
  - ����: `restaurant@test.com` / `123321`

### 5.2 �������̽���
1. ע������˺�
2. �ϴ�����ͼƬ�Ͳ�ƷͼƬ
3. ��Ӳ�Ʒ���˵�
4. ʹ���û��˺��������
5. ��������
6. ���Զ���״̬��ת
7. ����ʵʱ֪ͨ

### 5.3 ע������
1. ���д� Authorization ��������Ҫ�Ȼ�ȡ token
2. ͼƬ�ϴ���С����Ϊ 5MB
3. ����״̬�����Ҫ������ȷ������
4. WebSocket ������Ҫ��������