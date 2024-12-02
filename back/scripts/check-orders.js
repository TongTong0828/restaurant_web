const database = require('../config/database');

async function checkOrders() {
    const pool = database.getPool();
    
    try {
        // ��ȡ����Ķ���
        const [orders] = await pool.query(`
            SELECT 
                o.*,
                r.name as restaurant_name
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);
        
        console.log('\n����Ķ���:');
        console.log('----------------------------------------');
        
        for (const order of orders) {
            console.log(`\n����ID: ${order.id}`);
            console.log(`����: ${order.restaurant_name}`);
            console.log(`״̬: ${order.status}`);
            console.log(`�ܽ��: $${order.total_amount}`);
            console.log(`֧����ʽ: ${order.payment_method}`);
            console.log(`����ʱ��: ${order.created_at}`);
            
            // ��ȡ������Ŀ
            const [items] = await pool.query(`
                SELECT 
                    oi.*,
                    mi.name as menu_item_name
                FROM order_items oi
                LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            console.log('\n������Ŀ:');
            items.forEach(item => {
                console.log(`- ${item.menu_item_name || item.item_name}`);
                console.log(`  ����: ${item.quantity}`);
                console.log(`  ����: $${item.price}`);
                console.log(`  ��ƷID: ${item.menu_item_id || '��'}`);
            });
            
            try {
                const deliveryInfo = JSON.parse(order.delivery_info);
                console.log('\n������Ϣ:');
                console.log(`�ջ���: ${deliveryInfo.name}`);
                console.log(`�绰: ${deliveryInfo.phone}`);
                console.log(`��ַ: ${deliveryInfo.address}`);
                console.log(`��ע: ${deliveryInfo.instructions || '��'}`);
            } catch (e) {
                console.log('������Ϣ����ʧ��');
            }
            
            console.log('\n----------------------------------------');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkOrders(); 