# �����б��뽻�� API �����ĵ�

## 1. �����б�ӿ�

### 1.1 ��ȡ���в����б�
```http
GET /api/restaurants?page=1&limit=10&search=����&category=�в�&sort=rating
```

���������
- `page`: ҳ�루��ѡ��Ĭ��1��
- `limit`: ÿҳ��������ѡ��Ĭ��10��
- `search`: �����ؼ��ʣ���ѡ��
- `category`: ����ɸѡ����ѡ��
- `sort`: ����ʽ����ѡ��֧�� rating/deliveryFee/minimumOrder��

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

### 1.2 ��ȡ������ϸ��Ϣ�����������˵���
```http
GET /api/restaurants/:id
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
                    "category": "�Ȳ�",
                    "is_available": true
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

## 2. �û�-���������ӿ�

### 2.1 ��������
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
        "address": "�����г�����xx��xx��",
        "phone": "13800138000",
        "name": "����",
        "instructions": "��Ҫ̫��"
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
            "restaurant": {
                "id": 1,
                "name": "��ζ��",
                "phone": "1234567890"
            },
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
            },
            "created_at": "2023-12-20T10:00:00Z"
        }
    }
}
```

#### ʧ����Ӧ
```json
{
    "status": "fail",
    "message": "Restaurant is closed" | "Menu items not available" | "Minimum order amount not met"
}
```

### 2.2 �û��鿴����
```http
GET /api/auth/orders?status=all
Authorization: Bearer <token>
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
                "created_at": "2023-12-20T10:00:00Z",
                "items": [
                    {
                        "name": "��������",
                        "quantity": 2,
                        "price": 38.00
                    }
                ]
            }
        ]
    }
}
```

### 2.3 �������ն���
```http
GET /api/auth/restaurant/orders?status=pending
Authorization: Bearer <restaurant_token>
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

### 2.4 �������¶���״̬
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <restaurant_token>

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

## 3. ʵʱ����֪ͨ

### 3.1 WebSocket ����
```javascript
// ����WebSocket����
const ws = new WebSocket('ws://your-domain/ws');
ws.onopen = () => {
    // ������֤��Ϣ
    ws.send(JSON.stringify({
        type: 'auth',
        token: 'your_jwt_token'
    }));
};

// ������������
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'ORDER_UPDATE') {
        console.log('����״̬����:', data);
        // {
        //     type: 'ORDER_UPDATE',
        //     orderId: 1,
        //     status: 'confirmed',
        //     timestamp: '2023-12-20T10:05:00Z'
        // }
    }
};
```

## 4. ��������ʾ��

1. ��ȡ�����б�
```bash
curl -X GET "http://your-domain/api/restaurants?page=1&limit=10"
```

2. ��ȡ�ض���������
```bash
curl -X GET "http://your-domain/api/restaurants/1"
```

3. ��������
```bash
curl -X POST "http://your-domain/api/orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": 1,
    "items": [{"menu_item_id": 1, "quantity": 2}],
    "delivery_info": {
        "address": "�����г�����xx��xx��",
        "phone": "13800138000",
        "name": "����"
    },
    "payment_method": "online"
  }'
```

4. �����鿴��������
```bash
curl -X GET "http://your-domain/api/auth/restaurant/orders?status=pending" \
  -H "Authorization: Bearer <restaurant_token>"
```

5. ����ȷ�϶���
```bash
curl -X PUT "http://your-domain/api/orders/1/status" \
  -H "Authorization: Bearer <restaurant_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

## 5. ע������

1. **��֤Ҫ��**
   - �û���ز�����Ҫ�û�token
   - ������ز�����Ҫ����token
   - tokenͨ����¼�ӿڻ�ȡ

2. **����״̬��ת**
   - pending����ȷ�ϣ�
   - confirmed����ȷ�ϣ�
   - preparing��׼���У�
   - ready�������ͣ�
   - delivering�������У�
   - completed������ɣ�
   - cancelled����ȡ����

3. **������**
   - 401: δ��֤
   - 403: ��Ȩ��
   - 404: ��Դ������
   - 400: �����������
   - 500: ����������

4. **ʵʱ֪ͨ**
   - WebSocket������Ҫ��������
   - ���ߺ���Ҫ�Զ�����
   - ��Ҫ������֤ʧЧ����� 