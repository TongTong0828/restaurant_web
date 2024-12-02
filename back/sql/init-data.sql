-- 插入测试用户（密码都是 123321）
INSERT INTO users (email, password, name, phone, role) VALUES
('customer@test.com', '$2a$10$YG5jbRuFAyAJzPvekYBaZeGY2Xt3LrJxZrXnRk5OYSqG7mmCyqTZy', 'Test Customer', '1234567890', 'customer'),
('restaurant@test.com', '$2a$10$YG5jbRuFAyAJzPvekYBaZeGY2Xt3LrJxZrXnRk5OYSqG7mmCyqTZy', 'Test Restaurant', '0987654321', 'restaurant');

-- 插入测试分类
INSERT INTO categories (name) VALUES
('Chinese'),
('Fast Food'),
('Dessert');

-- 插入测试餐厅
INSERT INTO restaurants (name, description, address, phone, image, delivery_fee, minimum_order, opening_hours, status) VALUES
('Test Restaurant', 'A test restaurant', '123 Test St', '1234567890', 'https://example.com/image.jpg', 5.00, 15.00, '{"monday":{"open":"09:00","close":"22:00"}}', 'active');

-- 获取餐厅ID
SET @restaurant_id = LAST_INSERT_ID();

-- 插入餐厅分类关联
INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES
(@restaurant_id, 1);

-- 插入测试菜品
INSERT INTO menu_items (restaurant_id, name, description, price, category_id, is_available) VALUES
(@restaurant_id, 'Test Dish 1', 'A delicious test dish', 12.99, 1, true),
(@restaurant_id, 'Test Dish 2', 'Another delicious test dish', 15.99, 1, true),
(@restaurant_id, 'Test Dish 3', 'Yet another delicious test dish', 9.99, 1, true); 