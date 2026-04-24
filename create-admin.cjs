const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edugen_db',
    port: parseInt(process.env.DB_PORT || '3306')
  };

  const username = 'peyarm';
  const password = 'Siam@2520';

  console.log(`--- CREATING ADMIN USER: ${username} ---`);

  try {
    const pool = mysql.createPool(dbConfig);
    const hashedPassword = await bcrypt.hash(password, 10);

    // ตรวจสอบว่ามี user นี้อยู่แล้วหรือไม่
    const [existing] = await pool.execute('SELECT id FROM teachers WHERE citizen_id = ?', [username]);
    
    if (existing.length > 0) {
      // ถ้ามีอยู่แล้ว ให้ทำการอัปเดตรหัสผ่านแทน
      await pool.execute(
        'UPDATE teachers SET password = ?, name = ?, surname = ?, status = ? WHERE citizen_id = ?',
        [hashedPassword, 'Administrator', 'System', 'active', username]
      );
      console.log('--- ADMIN USER ALREADY EXISTS: PASSWORD UPDATED ---');
    } else {
      // ถ้ายังไม่มี ให้ทำการเพิ่มเข้าไปใหม่
      await pool.execute(
        'INSERT INTO teachers (citizen_id, name, surname, school, position, password, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, 'Administrator', 'System', 'Main School', 'Admin', hashedPassword, 'active']
      );
      console.log('--- ADMIN USER CREATED SUCCESSFULLY ---');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('--- ERROR CREATING ADMIN ---');
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
