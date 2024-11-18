import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config({ path: './test.env' }); // Load environment variables

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT BookISBN, DeviceID, MagID, MediaID, NotificationStatus
      FROM BorrowRecord
      WHERE NotificationStatus IN ('due_soon', 'overdue')
        AND Status = 'Active'
    `);

    const notifications = rows.map(row => ({
      title: row.NotificationStatus === 'overdue' ? 'Overdue Item' : 'Due Soon',
      body: `Item ${row.MagID || row.DeviceID || row.MediaID || row.BookISBN} is ${
        row.NotificationStatus === 'overdue' ? 'overdue' : 'due soon'
      }!`,
    }));

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Database query error:', error); // Log the error details
    res.status(500).json({ error: 'Database query failed' });
  }
}