const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const initDatabase = async () => {
  try {
    // �������ݿ�����
    const connection = await mysql.createConnection({
      host: 'restaurant-mysql.ns-9209e67m.svc',
      user: 'root',
      password: '6kmsc5tx',
      port: 3306
    });

    // �������ݿ�
    await connection.query('CREATE DATABASE IF NOT EXISTS restaurant');
    console.log('Database created or already exists');

    // ʹ�����ݿ�
    await connection.query('USE restaurant');

    // ��ȡ schema.sql �ļ�
    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // �ָ� SQL ��䲢ִ��
    const statements = schema
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement.trim() + ';');

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Database schema created successfully');

    // �ر�����
    await connection.end();
    
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase(); 