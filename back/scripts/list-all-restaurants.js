const database = require('../config/database');

async function listAllRestaurants() {
    const pool = database.getPool();
    
    try {
        // ��ȡ���в�����Ϣ
        const [restaurants] = await pool.query(`
            SELECT 
                r.*,
                GROUP_CONCAT(DISTINCT c.name) as categories
            FROM restaurants r
            LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
            LEFT JOIN categories c ON rc.category_id = c.id
            GROUP BY r.id
        `);
        
        console.log('\n���в�����Ϣ:');
        console.log('========================================');
        
        for (const restaurant of restaurants) {
            console.log(`\n����ID: ${restaurant.id}`);
            console.log(`����: ${restaurant.name}`);
            console.log(`����: ${restaurant.description || '��'}`);
            console.log(`��ַ: ${restaurant.address}`);
            console.log(`�绰: ${restaurant.phone}`);
            console.log(`״̬: ${restaurant.status}`);
            console.log(`����: ${restaurant.categories || '��'}`);
            console.log(`���ͷ�: $${restaurant.delivery_fee || 0}`);
            console.log(`��Ͷ���: $${restaurant.minimum_order || 0}`);
            console.log(`����: ${restaurant.rating || 0}`);
            
            // ��ȡ�ò����Ĳ�Ʒ
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
                console.log('\n��Ʒ�б�:');
                console.log('----------------------------------------');
                
                let currentCategory = '';
                menuItems.forEach(item => {
                    if (item.category_name !== currentCategory) {
                        currentCategory = item.category_name;
                        console.log(`\n[${currentCategory || 'δ����'}]`);
                    }
                    
                    console.log(`\n- ${item.name}`);
                    console.log(`  ��ƷID: ${item.id}`);
                    console.log(`  ����: ${item.description || '��'}`);
                    console.log(`  �۸�: $${item.price}`);
                    console.log(`  ״̬: ${item.is_available ? '����' : '������'}`);
                    if (item.image_url) {
                        console.log(`  ͼƬ: ${item.image_url}`);
                    }
                });
            } else {
                console.log('\n���޲�Ʒ');
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