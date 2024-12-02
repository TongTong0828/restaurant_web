-- 清空并重置分类表
TRUNCATE TABLE categories;
ALTER TABLE categories AUTO_INCREMENT = 1;

-- 插入所有分类（ID是固定的）
INSERT INTO categories (id, name) VALUES
(1, 'Japanese'),
(2, 'Sushi'),
(3, 'Seafood'),
(4, 'Italian'),
(5, 'Pizza'),
(6, 'Pasta'),
(7, 'Chinese'),
(8, 'Asian'),
(9, 'Fine Dining'),
(10, 'Western'),
(11, 'Main Dishes'),
(12, 'Appetizers'),
(13, 'Rolls'),
(14, 'Nigiri'),
(15, 'Hot Dishes'),
(16, 'Pizzas'),
(17, 'Sides'); 