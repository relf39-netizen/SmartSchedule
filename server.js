import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Database setup (MySQL)
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'schoolos_timetable',
    password: process.env.DB_PASSWORD || 'rVGlje??oU849czf',
    database: process.env.DB_NAME || 'schoolos_timetable',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  let pool;
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MySQL pool (Configured via .env)');
    pool.getConnection().then(conn => {
      console.log('Successfully connected to MySQL database');
      conn.release();
    }).catch(err => {
      console.error('MySQL Connection Test Failed!', err.message);
    });
  } catch (err) {
    console.error('MySQL Pool Creation Error:', err);
  }

  app.use(express.json());
  app.use(cors());
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    // Cut /server.cjs from URL if present (for IIS/Plesk compatibility)
    if (req.url.startsWith('/server.cjs')) {
      req.url = req.url.replace('/server.cjs', '');
      if (req.url === '') req.url = '/';
    }
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(session({
    secret: 'edugen-secret-key-123',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: false, // เปลี่ยนเป็น true ถ้าใช้ https และมีปัญหา
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { citizen_id, name, surname, school, position, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute(
        'INSERT INTO teachers (citizen_id, name, surname, school, position, password, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [citizen_id, name, surname, school, position, hashedPassword, 'pending']
      );
      res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ' });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.code === 'ER_DUP_ENTRY' ? 'หมายเลขประจำตัวประชาชนนี้ได้สมัครเข้ามาในระบบแล้ว' : `เกิดข้อผิดพลาดในการลงทะเบียน: ${error.message}` 
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { citizen_id, password } = req.body;
    console.log(`Login attempt for: ${citizen_id}`);
    
    if (!citizen_id || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    if (citizen_id === 'admin' && password === 'admin123') {
      req.session.user = { id: 0, role: 'admin', name: 'System Admin' };
      return res.json({ success: true, user: req.session.user });
    }
    
    try {
      console.log('Querying database for user...');
      const [rows] = await pool.execute('SELECT * FROM teachers WHERE citizen_id = ?', [citizen_id]);
      const user = rows[0];
      
      if (user) {
        console.log('User found, comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'บัญชีของคุณกำลังรอการตรวจสอบจากผู้ดูแลระบบ' });
          }
          
          // Increment login count and update last login
          await pool.execute('UPDATE teachers SET login_count = login_count + 1, last_login = NOW() WHERE id = ?', [user.id]);
          req.session.user = { 
            id: user.id, 
            role: user.role || 'teacher', 
            name: user.name, 
            surname: user.surname,
            ai_key: user.ai_key, 
            school: user.school,
            position: user.position
          };
          console.log('Login successful');
          res.json({ success: true, user: req.session.user });
        } else {
          console.log('Password mismatch');
          res.status(401).json({ success: false, message: 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง' });
        }
      } else {
        console.log('User not found');
        res.status(401).json({ success: false, message: 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง' });
      }
    } catch (error) {
      console.error('Login Database Error:', error);
      res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session?.user) {
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false });
    }
  });

  app.get('/debug/files', async (req, res) => {
    try {
      const distPath = path.resolve(__dirname, 'dist');
      const files = await fs.readdir(distPath);
      res.json({ distPath, files });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Settings Routes
  app.get('/api/settings', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute('SELECT * FROM settings WHERE school = ? ORDER BY id DESC LIMIT 1', [school]);
      res.json(rows[0] || {
        school_name: school,
        school: school,
        academic_year: '2567',
        semester: '1',
        periods_per_day: 8,
        period_duration: 50,
        start_time: '08:30:00'
      });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/settings', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { school_name, academic_year, semester, periods_per_day, period_duration, start_time } = req.body;
    try {
      const [rows] = await pool.execute('SELECT id FROM settings WHERE school = ? ORDER BY id DESC LIMIT 1', [user.school]);
      if (rows[0]) {
        await pool.execute(
          'UPDATE settings SET school_name=?, academic_year=?, semester=?, periods_per_day=?, period_duration=?, start_time=? WHERE id=?',
          [school_name, academic_year, semester, periods_per_day, period_duration, start_time, rows[0].id]
        );
      } else {
        await pool.execute(
          'INSERT INTO settings (school_name, school, academic_year, semester, periods_per_day, period_duration, start_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [school_name, user.school, academic_year, semester, periods_per_day, period_duration, start_time]
        );
      }
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  // Fixed Periods Routes
  app.get('/api/fixed-periods', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute('SELECT * FROM fixed_periods WHERE school = ?', [school]);
      res.json(rows);
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/fixed-periods', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { activity_name, day_of_week, period_number, is_lunch_break, apply_all_week } = req.body;
    try {
      if (apply_all_week) {
        const days = req.body.days_th || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        for (const day of days) {
          // Check if already exists to prevent duplicates
          const [existing] = await pool.execute(
            'SELECT id FROM fixed_periods WHERE school=? AND activity_name=? AND day_of_week=? AND period_number=?',
            [user.school, activity_name, day, period_number]
          );
          if (existing.length === 0) {
            await pool.execute(
              'INSERT INTO fixed_periods (school, activity_name, day_of_week, period_number, is_lunch_break) VALUES (?, ?, ?, ?, ?)',
              [user.school, activity_name, day, period_number, is_lunch_break ? 1 : 0]
            );
          }
        }
      } else {
        await pool.execute(
          'INSERT INTO fixed_periods (school, activity_name, day_of_week, period_number, is_lunch_break) VALUES (?, ?, ?, ?, ?)',
          [user.school, activity_name, day_of_week, period_number, is_lunch_break ? 1 : 0]
        );
      }
      res.json({ success: true });
    } catch (error) { 
      console.error('Fixed Period Error:', error);
      res.status(500).send(); 
    }
  });

  app.delete('/api/fixed-periods/:id', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    try {
      await pool.execute('DELETE FROM fixed_periods WHERE id = ? AND school = ?', [req.params.id, user.school]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.put('/api/fixed-periods/:id', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { activity_name, day_of_week, period_number, is_lunch_break } = req.body;
    try {
      await pool.execute(
        'UPDATE fixed_periods SET activity_name=?, day_of_week=?, period_number=?, is_lunch_break=? WHERE id=? AND school=?',
        [activity_name, day_of_week, period_number, is_lunch_break ? 1 : 0, req.params.id, user.school]
      );
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  // Basic Management Routes (Subjects, Classes, Rooms)
  app.get('/api/subjects', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute('SELECT * FROM subjects WHERE school = ?', [school]);
      res.json(rows);
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/subjects', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { code, name, level, weekly_hours, color } = req.body;
    try {
      await pool.execute(
        'INSERT INTO subjects (school, code, name, level, weekly_hours, color) VALUES (?, ?, ?, ?, ?, ?)',
        [user.school, code, name, level, weekly_hours, color]
      );
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.get('/api/classes', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, r.name as room_name 
        FROM classes c 
        LEFT JOIN rooms r ON c.main_room_id = r.id
        WHERE c.school = ?
      `, [school]);
      res.json(rows);
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/classes', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { name, level, main_room_id } = req.body;
    try {
      await pool.execute('INSERT INTO classes (school, name, level, main_room_id) VALUES (?, ?, ?, ?)', [user.school, name, level, main_room_id]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.get('/api/rooms', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute('SELECT * FROM rooms WHERE school = ?', [school]);
      res.json(rows);
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/rooms', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { name, type, capacity } = req.body;
    try {
      await pool.execute('INSERT INTO rooms (school, name, type, capacity) VALUES (?, ?, ?, ?)', [user.school, name, type, capacity]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  // Teaching Assignments
  app.get('/api/teaching-assignments', async (req, res) => {
    const school = req.session?.user?.school;
    if (!school) return res.status(401).send();
    try {
      const [rows] = await pool.execute(`
        SELECT ta.*, t.name as teacher_name, t.surname as teacher_surname, 
               s.name as subject_name, s.code as subject_code,
               c.name as class_name,
               r1.name as main_room_name, r2.name as backup_room_name
        FROM teaching_assignments ta
        LEFT JOIN teachers t ON ta.teacher_id = t.id
        LEFT JOIN subjects s ON ta.subject_id = s.id
        LEFT JOIN classes c ON ta.class_id = c.id
        LEFT JOIN rooms r1 ON ta.main_room_id = r1.id
        LEFT JOIN rooms r2 ON ta.backup_room_id = r2.id
        WHERE ta.school = ?
      `, [school]);
      res.json(rows);
    } catch (error) { 
      console.error('Fetch Assignments Error:', error);
      res.status(500).send(); 
    }
  });

  app.post('/api/teaching-assignments', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    const { teacher_id, subject_id, class_id, hours_per_week, is_double_period, main_room_id, backup_room_id } = req.body;
    
    console.log('Adding Teaching Assignment:', req.body);
    
    try {
      if (!teacher_id || !subject_id || !class_id) {
        return res.status(400).json({ success: false, message: 'กรุณาเลือก ครูผู้สอน วิชา และกลุ่มเรียน ให้ครบถ้วน' });
      }

      const [res_insert] = await pool.execute(
        'INSERT INTO teaching_assignments (school, teacher_id, subject_id, class_id, hours_per_week, is_double_period, main_room_id, backup_room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.school, teacher_id, subject_id, class_id, hours_per_week, is_double_period ? 1 : 0, main_room_id || null, backup_room_id || null]
      );
      console.log('Assignment added:', res_insert);
      res.json({ success: true });
    } catch (error) { 
      console.error('Teaching Assignment Error Details:', error);
      res.status(500).json({ success: false, message: `เกิดข้อผิดพลาดรหัส: ${error.code} - ${error.message}` }); 
    }
  });

  app.delete('/api/teaching-assignments/:id', async (req, res) => {
    const user = req.session?.user;
    if (user?.role !== 'admin' || !user.school) return res.status(403).send();
    try {
      await pool.execute('DELETE FROM teaching_assignments WHERE id = ? AND school = ?', [req.params.id, user.school]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  // Admin Routes
  app.get('/api/admin/teachers', async (req, res) => {
    const adminUser = req.session?.user;
    if (adminUser?.role !== 'admin') return res.status(403).send();
    try {
      let query = `
        SELECT t.id, t.citizen_id, t.name, t.surname, t.school, t.position, t.status, t.role, t.login_count, t.last_login
        FROM teachers t
      `;
      let params = [];
      if (adminUser && adminUser.id !== 0) {
        query += ' WHERE t.school = ?';
        params.push(adminUser.school);
      }
      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) { 
      console.error('Admin Fetch Error:', error);
      res.status(500).send(); 
    }
  });

  app.post('/api/admin/change-role', async (req, res) => {
    if (req.session?.user?.role !== 'admin') return res.status(403).send();
    const { id, role } = req.body;
    try {
      await pool.execute('UPDATE teachers SET role = ? WHERE id = ?', [role, id]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/admin/approve', async (req, res) => {
    if (req.session?.user?.role !== 'admin') return res.status(403).send();
    const { id, status } = req.body;
    try {
      await pool.execute('UPDATE teachers SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/admin/delete-teacher', async (req, res) => {
    if (req.session?.user?.role !== 'admin') return res.status(403).send();
    const { id } = req.body;
    try {
      await pool.execute('DELETE FROM teachers WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/admin/db-sync', async (req, res) => {
    if (req.session?.user?.role !== 'admin') return res.status(403).send();
    try {
      // 1. Settings Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school_name VARCHAR(255) NOT NULL,
          school VARCHAR(200) NOT NULL,
          academic_year VARCHAR(10) NOT NULL,
          semester VARCHAR(10) NOT NULL,
          periods_per_day INT DEFAULT 8,
          period_duration INT DEFAULT 50,
          start_time TIME DEFAULT '08:30:00',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (school)
        )
      `);

      // 2. Fixed Periods Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS fixed_periods (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          activity_name VARCHAR(255) NOT NULL,
          day_of_week VARCHAR(50) NOT NULL,
          period_number INT NOT NULL,
          is_lunch_break TINYINT DEFAULT 0,
          INDEX (school)
        )
      `);

      try { await pool.execute('ALTER TABLE fixed_periods MODIFY COLUMN day_of_week VARCHAR(50)'); } catch (e) {}

      // 3. Teachers Table (Migration safe)
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          citizen_id VARCHAR(20) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          surname VARCHAR(100) NOT NULL,
          school VARCHAR(200),
          position VARCHAR(100),
          password VARCHAR(255) NOT NULL,
          ai_key TEXT,
          role ENUM('teacher', 'admin') DEFAULT 'teacher',
          status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
          login_count INT DEFAULT 0,
          last_login DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (school)
        )
      `);

      // Migration for role column
      try { await pool.execute('ALTER TABLE teachers ADD COLUMN role ENUM(\'teacher\', \'admin\') DEFAULT \'teacher\''); } catch (e) {}
      try { await pool.execute('ALTER TABLE teachers MODIFY COLUMN ai_key TEXT'); } catch (e) {}
      try { await pool.execute('ALTER TABLE teachers ADD COLUMN login_count INT DEFAULT 0'); } catch (e) {}
      try { await pool.execute('ALTER TABLE teachers ADD COLUMN last_login DATETIME NULL'); } catch (e) {}

      // 4. Subjects Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS subjects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(200) NOT NULL,
          level VARCHAR(50) NOT NULL,
          weekly_hours INT DEFAULT 1,
          color VARCHAR(20) DEFAULT '#4f46e5',
          INDEX (school)
        )
      `);

      // 5. Rooms Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(100) DEFAULT 'ทั่วไป',
          capacity INT DEFAULT 40,
          INDEX (school)
        )
      `);

      // 6. Classes Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS classes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          name VARCHAR(100) NOT NULL,
          level VARCHAR(50) NOT NULL,
          main_room_id INT,
          FOREIGN KEY (main_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
          INDEX (school)
        )
      `);

      // 7. Teaching Assignments Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS teaching_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          teacher_id INT NOT NULL,
          subject_id INT NOT NULL,
          class_id INT NOT NULL,
          hours_per_week INT NOT NULL,
          is_double_period TINYINT DEFAULT 0,
          main_room_id INT,
          backup_room_id INT,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
          INDEX (school)
        )
      `);

      // 8. Timetables Table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS timetables (
          id INT AUTO_INCREMENT PRIMARY KEY,
          school VARCHAR(200) NOT NULL,
          teacher_id INT,
          class_id INT,
          title VARCHAR(255) NOT NULL,
          data LONGTEXT NOT NULL,
          academic_year VARCHAR(10),
          semester VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (school)
        )
      `);

      // 9. Initial Admin (peyarm / Siam@2520)
      await pool.execute(`
        INSERT INTO teachers (citizen_id, password, name, surname, school, position, status, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status='active', role='admin'
      `, [
        'peyarm', 
        '$2b$10$HS9dc4t6U7QkH35xLKDQVOaNt6l8XYJ06./oMZjtok.fGQp9Gw.pW', 
        'Administrator', 
        'System', 
        'Main School', 
        'Admin', 
        'active', 
        'admin'
      ]);

      res.json({ success: true, message: 'ฐานข้อมูลได้รับการปรับปรุงเรียบร้อยแล้ว' });
    } catch (error) { 
      console.error('DB Sync Error:', error);
      res.status(500).json({ success: false, message: error.message }); 
    }
  });

  // Timetable Routes
  app.get('/api/timetables', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).send();
    try {
      let query = 'SELECT * FROM timetables WHERE school = ?';
      let params = [user.school];
      
      // If regular teacher, only see their own? 
      // Actually school admin should see all.
      if (user.role !== 'admin') {
        query += ' AND teacher_id = ?';
        params.push(user.id);
      }
      
      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) { res.status(500).send(); }
  });

  app.get('/api/timetables/:id', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).send();
    const { id } = req.params;
    try {
      const [rows] = await pool.execute('SELECT * FROM timetables WHERE id = ? AND school = ?', [id, user.school]);
      if (rows[0]) {
        res.json(rows[0]);
      } else {
        res.status(404).send();
      }
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/timetables', async (req, res) => {
    const user = req.session?.user;
    if (!user || !user.school) return res.status(401).send();
    const { title, data } = req.body;
    try {
      const [result] = await pool.execute(
        'INSERT INTO timetables (school, teacher_id, title, data) VALUES (?, ?, ?, ?)',
        [user.school, user.id, title, JSON.stringify(data)]
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/timetables/:id/delete', async (req, res) => {
    const user = req.session?.user;
    if (!user || !user.school) return res.status(401).send();
    const { id } = req.params;
    try {
      // Admin can delete any in school, teacher only their own
      let query = 'DELETE FROM timetables WHERE id = ? AND school = ?';
      let params = [id, user.school];
      if (user.role !== 'admin') {
        query += ' AND teacher_id = ?';
        params.push(user.id);
      }
      await pool.execute(query, params);
      res.json({ success: true });
    } catch (error) { res.status(500).send(); }
  });

  app.post('/api/profile/key', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).send();
    const { ai_key } = req.body;
    try {
      await pool.execute('UPDATE teachers SET ai_key = ? WHERE id = ?', [ai_key, user.id]);
      req.session.user.ai_key = ai_key;
      req.session.save(() => {
        res.json({ success: true });
      });
    } catch (error) { 
      console.error('Update key error:', error);
      res.status(500).send(); 
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // ใช้ process.cwd() เพื่อให้มั่นใจเรื่องตำแหน่งใน Windows และ IIS
    const rootPath = process.cwd();
    const distPath = path.join(rootPath, 'dist');
    
    console.log('Root directory:', rootPath);
    console.log('Serving static files from:', distPath);
    
    // ตั้งค่าให้ Express ส่งไฟล์ Static โดยตรง
    app.use(express.static(distPath));
    
    // สำหรับ SPA: ถ้าหาไฟล์ไม่เจอ ให้ส่ง index.html กลับไป
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // On Windows IIS/iisnode, we listen to process.env.PORT directly
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started`);
  });
}

startServer();
