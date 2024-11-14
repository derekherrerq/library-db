import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Add this line to include the port
});


export default async function handler(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT BookISBN, DueDate 
      FROM borrowrecords 
      WHERE (DueDate BETWEEN CURDATE() AND CURDATE() + INTERVAL 2 DAY) 
      OR (DueDate < CURDATE() AND ReturnDate IS NULL)
    `);

    const notifications = rows.map(row => ({
      title: row.DueDate < new Date() ? 'Overdue Item' : 'Due Soon',
      body: `Item ${row.BookISBN} is ${row.DueDate < new Date() ? 'overdue' : 'due soon'}!`,
    }));

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
}
