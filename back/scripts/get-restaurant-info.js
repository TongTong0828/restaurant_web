const database = require('../config/database');

async function getRestaurantInfo() {
    const pool = database.getPool();
    const targetRestaurantId = 2; // Chinese Restaurant
    
    try {
        // 获取餐厅信息
        const [restaurants] = await pool.query(`
            SELECT * FROM restaurants WHERE id = ?
        `, [targetRestaurantId]);
        
        if (restaurants.length === 0) {
            console.log('未找到餐厅');
            return;
        }
        
        const restaurant = restaurants[0];
        console.log('\n========================================');
        console.log('餐厅信息:');
        console.log('----------------------------------------');
        console.log(`ID: ${restaurant.id}`);
        console.log(`名称: ${restaurant.name}`);
        console.log(`地址: ${restaurant.address}`);
        
        // 获取所有分类
        const [categories] = await pool.query(`
            SELECT DISTINCT c.id, c.name
            FROM categories c
            JOIN menu_items mi ON c.id = mi.category_id
            WHERE mi.restaurant_id = ?
            ORDER BY c.name
        `, [targetRestaurantId]);
        
        console.log('\n分类信息:');
        console.log('----------------------------------------');
        categories.forEach(category => {
            console.log(`分类ID: ${category.id}, 名称: ${category.name}`);
        });
        
        // 获取该餐厅的所有菜品信息
        const [menuItems] = await pool.query(`
            SELECT 
                mi.*,
                c.id as category_id,
                c.name as category_name
            FROM menu_items mi
            LEFT JOIN categories c ON mi.category_id = c.id
            WHERE mi.restaurant_id = ?
            ORDER BY c.name, mi.name
        `, [targetRestaurantId]);
        
        console.log('\n菜品详细信息:');
        console.log('----------------------------------------');
        let currentCategory = '';
        menuItems.forEach(item => {
            if (item.category_name !== currentCategory) {
                currentCategory = item.category_name;
                console.log(`\n[${currentCategory || '未分类'}] (分类ID: ${item.category_id || '无'})`);
            }
            console.log(`\n- ${item.name}`);
            console.log(`  菜品ID: ${item.id}`);
            console.log(`  分类ID: ${item.category_id || '无'}`);
            console.log(`  价格: $${item.price}`);
            console.log(`  描述: ${item.description || '无'}`);
            console.log(`  图片: ${item.image_url || '无'}`);
            console.log(`  状态: ${item.is_available ? '可用' : '不可用'}`);
            console.log(`  创建时间: ${item.created_at}`);
            console.log(`  更新时间: ${item.updated_at}`);
        });
        
        console.log('\n========================================');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

getRestaurantInfo(); 