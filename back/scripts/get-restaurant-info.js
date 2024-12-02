const database = require('../config/database');

async function getRestaurantInfo() {
    const pool = database.getPool();
    const targetRestaurantId = 2; // Chinese Restaurant
    
    try {
        // ��ȡ������Ϣ
        const [restaurants] = await pool.query(`
            SELECT * FROM restaurants WHERE id = ?
        `, [targetRestaurantId]);
        
        if (restaurants.length === 0) {
            console.log('δ�ҵ�����');
            return;
        }
        
        const restaurant = restaurants[0];
        console.log('\n========================================');
        console.log('������Ϣ:');
        console.log('----------------------------------------');
        console.log(`ID: ${restaurant.id}`);
        console.log(`����: ${restaurant.name}`);
        console.log(`��ַ: ${restaurant.address}`);
        
        // ��ȡ���з���
        const [categories] = await pool.query(`
            SELECT DISTINCT c.id, c.name
            FROM categories c
            JOIN menu_items mi ON c.id = mi.category_id
            WHERE mi.restaurant_id = ?
            ORDER BY c.name
        `, [targetRestaurantId]);
        
        console.log('\n������Ϣ:');
        console.log('----------------------------------------');
        categories.forEach(category => {
            console.log(`����ID: ${category.id}, ����: ${category.name}`);
        });
        
        // ��ȡ�ò��������в�Ʒ��Ϣ
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
        
        console.log('\n��Ʒ��ϸ��Ϣ:');
        console.log('----------------------------------------');
        let currentCategory = '';
        menuItems.forEach(item => {
            if (item.category_name !== currentCategory) {
                currentCategory = item.category_name;
                console.log(`\n[${currentCategory || 'δ����'}] (����ID: ${item.category_id || '��'})`);
            }
            console.log(`\n- ${item.name}`);
            console.log(`  ��ƷID: ${item.id}`);
            console.log(`  ����ID: ${item.category_id || '��'}`);
            console.log(`  �۸�: $${item.price}`);
            console.log(`  ����: ${item.description || '��'}`);
            console.log(`  ͼƬ: ${item.image_url || '��'}`);
            console.log(`  ״̬: ${item.is_available ? '����' : '������'}`);
            console.log(`  ����ʱ��: ${item.created_at}`);
            console.log(`  ����ʱ��: ${item.updated_at}`);
        });
        
        console.log('\n========================================');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

getRestaurantInfo(); 