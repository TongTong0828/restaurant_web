const database = require('../config/database');

async function listAllRestaurants() {
    const pool = database.getPool();
    
    try {
        // 获取所有餐厅信息
        const [restaurants] = await pool.query(`
            SELECT 
                r.*,
                GROUP_CONCAT(DISTINCT c.name) as categories
            FROM restaurants r
            LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
            LEFT JOIN categories c ON rc.category_id = c.id
            GROUP BY r.id
        `);
        
        console.log('\n所有餐厅信息:');
        console.log('========================================');
        
        for (const restaurant of restaurants) {
            console.log(`\n餐厅ID: ${restaurant.id}`);
            console.log(`名称: ${restaurant.name}`);
            console.log(`描述: ${restaurant.description || '无'}`);
            console.log(`地址: ${restaurant.address}`);
            console.log(`电话: ${restaurant.phone}`);
            console.log(`状态: ${restaurant.status}`);
            console.log(`分类: ${restaurant.categories || '无'}`);
            console.log(`配送费: $${restaurant.delivery_fee || 0}`);
            console.log(`最低订单: $${restaurant.minimum_order || 0}`);
            console.log(`评分: ${restaurant.rating || 0}`);
            
            // 获取该餐厅的菜品
            const [menuItems] = await pool.query(`
                SELECT 
                    m.*,
                    c.name as category_name
                FROM menu_items m
                LEFT JOIN categories c ON m.category_id = c.id
                WHERE m.restaurant_id = ?
                ORDER BY c.name, m.name
            `, [restaurant.id]);
            
            if (menuItems.length > 0) {
                console.log('\n菜品列表:');
                console.log('----------------------------------------');
                
                let currentCategory = '';
                menuItems.forEach(item => {
                    if (item.category_name !== currentCategory) {
                        currentCategory = item.category_name;
                        console.log(`\n[${currentCategory || '未分类'}]`);
                    }
                    
                    console.log(`\n- ${item.name}`);
                    console.log(`  菜品ID: ${item.id}`);
                    console.log(`  描述: ${item.description || '无'}`);
                    console.log(`  价格: $${item.price}`);
                    console.log(`  状态: ${item.is_available ? '可用' : '不可用'}`);
                    if (item.image_url) {
                        console.log(`  图片: ${item.image_url}`);
                    }
                });
            } else {
                console.log('\n暂无菜品');
            }
            
            console.log('\n========================================');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

listAllRestaurants(); 