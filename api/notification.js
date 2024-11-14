import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export default async function handler(req, res) {
  try {
    // Select BorrowRecord data with NotificationStatus
    const [rows] = await db.query(`
      SELECT BookISBN, DeviceID, MagID, MediaID, NotificationStatus
      FROM BorrowRecord
      WHERE NotificationStatus IN ('due_soon', 'overdue')
    `);

    // Map the rows to the notification format
    const notifications = rows.map(row => {
      return {
        title: row.NotificationStatus === 'overdue' ? 'Overdue Item' : 'Due Soon',
        body: `Item ${row.MagID} is ${row.NotificationStatus === 'overdue' ? 'overdue' : 'due soon'}!`,
      };
    });

    // Send the notifications in the response
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
}
