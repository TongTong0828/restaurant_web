const database = require('../config/database');

async function checkOrders() {
    const pool = database.getPool();
    
    try {
        // 获取最近的订单
        const [orders] = await pool.query(`
            SELECT 
                o.*,
                r.name as restaurant_name
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);
        
        console.log('\n最近的订单:');
        console.log('----------------------------------------');
        
        for (const order of orders) {
            console.log(`\n订单ID: ${order.id}`);
            console.log(`餐厅: ${order.restaurant_name}`);
            console.log(`状态: ${order.status}`);
            console.log(`总金额: $${order.total_amount}`);
            console.log(`支付方式: ${order.payment_method}`);
            console.log(`创建时间: ${order.created_at}`);
            
            // 获取订单项目
            const [items] = await pool.query(`
                SELECT 
                    oi.*,
                    mi.name as menu_item_name
                FROM order_items oi
                LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            console.log('\n订单项目:');
            items.forEach(item => {
                console.log(`- ${item.menu_item_name || item.item_name}`);
                console.log(`  数量: ${item.quantity}`);
                console.log(`  单价: $${item.price}`);
                console.log(`  菜品ID: ${item.menu_item_id || '无'}`);
            });
            
            try {
                const deliveryInfo = JSON.parse(order.delivery_info);
                console.log('\n配送信息:');
                console.log(`收货人: ${deliveryInfo.name}`);
                console.log(`电话: ${deliveryInfo.phone}`);
                console.log(`地址: ${deliveryInfo.address}`);
                console.log(`备注: ${deliveryInfo.instructions || '无'}`);
            } catch (e) {
                console.log('配送信息解析失败');
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